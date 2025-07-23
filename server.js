// server.js
// File utama untuk server backend mini media sosial

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Muat variabel lingkungan dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini_social_db';
mongoose.connect(mongoUri)
  .then(() => console.log('Terhubung ke MongoDB!'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Skema dan Model MongoDB ---

// Skema Pengguna
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  bio: { type: String, default: '' },
});
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
const User = mongoose.model('User', userSchema);

// Skema Posting
const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model('Post', postSchema);

// Skema Komentar
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model('Comment', commentSchema);

// --- Middleware Autentikasi ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Route API ---

// Root Route
app.get('/', (req, res) => {
  res.send('Backend Mini Media Sosial Berjalan!');
});

// --- Autentikasi ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    const user = new User({ username, password, name });
    await user.save();
    res.status(201).json({ message: 'Pengguna berhasil terdaftar.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Nama pengguna sudah ada.' });
    }
    res.status(500).json({ message: 'Gagal mendaftar.', error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Nama pengguna atau password salah.' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login berhasil!', token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Gagal login.', error: err.message });
  }
});

// --- Posting Status ---
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan posting.', error: err.message });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const post = new Post({ content, user: req.user.id });
    await post.save();
    await post.populate('user', 'username name');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat posting.', error: err.message });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ message: 'Posting tidak ditemukan atau Anda tidak memiliki akses.' });
    res.json({ message: 'Posting berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus posting.', error: err.message });
  }
});

// --- Komentar ---
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('user', 'username name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan komentar.', error: err.message });
  }
});

app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = new Comment({ content, user: req.user.id, post: req.params.id });
    await comment.save();
    await comment.populate('user', 'username name');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan komentar.', error: err.message });
  }
});

// --- Profil Pengguna ---
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username name bio');
    if (!user) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan profil.', error: err.message });
  }
});

// --- Jalankan Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
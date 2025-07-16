// server.js
// Ini adalah file utama untuk server Node.js

// Import modul-modul yang dibutuhkan
const express = require('express'); // Framework web untuk Node.js
const mongoose = require('mongoose'); // ODM (Object Data Modeling) untuk MongoDB
const bcrypt = require('bcryptjs'); // Untuk hashing password
const jwt = require('jsonwebtoken'); // Untuk otentikasi berbasis token
const cors = require('cors'); // Untuk mengizinkan permintaan dari domain yang berbeda
const dotenv = require('dotenv'); // Untuk memuat variabel lingkungan dari file .env

// Muat variabel lingkungan dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Mengizinkan semua permintaan lintas domain
app.use(express.json()); // Mengizinkan aplikasi untuk mengurai JSON dari body request

// Konfigurasi Database MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager_db';

mongoose.connect(mongoUri)
  .then(() => console.log('Terhubung ke MongoDB!'))
  .then(() => console.log('Database URL:', mongoUri)) // Tambahkan log untuk URI
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- Definisi Schema dan Model MongoDB ---

// Schema Pengguna
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Middleware Mongoose untuk hashing password sebelum menyimpan
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// Schema Kategori
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Kategori milik pengguna tertentu
});
const Category = mongoose.model('Category', categorySchema);

// Schema Tugas
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Tugas bisa punya kategori
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Tugas milik pengguna tertentu
  createdAt: { type: Date, default: Date.now },
});
const Task = mongoose.model('Task', taskSchema);

// --- Middleware Autentikasi ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil token dari header 'Bearer TOKEN'

  if (token == null) return res.sendStatus(401); // Jika tidak ada token, kembalikan 401 Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Jika token tidak valid, kembalikan 403 Forbidden
    req.user = user; // Tambahkan payload user ke objek request
    next(); // Lanjutkan ke handler route berikutnya
  });
};

// --- Route API ---

// Route Root (untuk testing server)
app.get('/', (req, res) => {
  res.send('Backend Aplikasi Manajemen Tugas Berjalan!');
});

// --- Route Autentikasi ---

// Registrasi Pengguna Baru
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'Pengguna berhasil terdaftar.' });
  } catch (err) {
    if (err.code === 11000) { // Kode error MongoDB untuk duplikasi kunci (unique)
      return res.status(400).json({ message: 'Nama pengguna sudah ada.' });
    }
    res.status(500).json({ message: 'Gagal mendaftarkan pengguna.', error: err.message });
  }
});

// Login Pengguna
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Nama pengguna atau password salah.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nama pengguna atau password salah.' });
    }

    // Buat token JWT
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login berhasil!', token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Gagal login.', error: err.message });
  }
});

// --- Route Kategori (Membutuhkan Autentikasi) ---

// Mendapatkan semua kategori untuk pengguna yang terautentikasi
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan kategori.', error: err.message });
  }
});

// Membuat kategori baru
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({ name, user: req.user.id });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Nama kategori sudah ada.' });
    }
    res.status(500).json({ message: 'Gagal membuat kategori.', error: err.message });
  }
});

// Mengupdate kategori berdasarkan ID
app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name },
      { new: true } // Mengembalikan dokumen yang sudah diupdate
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
    }
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengupdate kategori.', error: err.message });
  }
});

// Menghapus kategori berdasarkan ID
app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan atau Anda tidak memiliki akses.' });
    }
    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus kategori.', error: err.message });
  }
});

// --- Route Tugas (Membutuhkan Autentikasi) ---

// Mendapatkan semua tugas untuk pengguna yang terautentikasi (opsional filter berdasarkan kategori)
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { categoryId, completed } = req.query; // Ambil filter dari query params
    let query = { user: req.user.id };

    if (categoryId) {
      query.category = categoryId;
    }
    if (completed !== undefined) {
      query.completed = completed === 'true'; // Konversi string 'true'/'false' ke boolean
    }

    const tasks = await Task.find(query).populate('category', 'name'); // Populate nama kategori
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan tugas.', error: err.message });
  }
});

// Membuat tugas baru
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, categoryId } = req.body;
    const newTask = new Task({
      title,
      description,
      category: categoryId || null, // Jika categoryId tidak ada, set null
      user: req.user.id,
    });
    await newTask.save();
    // Setelah disimpan, populate kembali untuk mendapatkan objek kategori jika ada
    await newTask.populate('category', 'name');
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Gagal membuat tugas.', error: err.message });
  }
});

// Mendapatkan tugas berdasarkan ID
app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id }).populate('category', 'name');
    if (!task) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan atau Anda tidak memiliki akses.' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mendapatkan tugas.', error: err.message });
  }
});

// Mengupdate tugas berdasarkan ID
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, completed, categoryId } = req.body;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, completed, category: categoryId || null },
      { new: true }
    ).populate('category', 'name');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan atau Anda tidak memiliki akses.' });
    }
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengupdate tugas.', error: err.message });
  }
});

// Menghapus tugas berdasarkan ID
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedTask) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan atau Anda tidak memiliki akses.' });
    }
    res.json({ message: 'Tugas berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus tugas.', error: err.message });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

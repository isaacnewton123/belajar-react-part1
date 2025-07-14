// server.js
require('dotenv').config();

// --- 1. Impor Modul ---
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Library untuk berinteraksi dengan MongoDB

// --- 2. Inisialisasi & Konfigurasi ---
const app = express();
const PORT = process.env.PORT || 8080;

// URL koneksi ke database MongoDB Anda.
// Sangat disarankan untuk menggunakan environment variable untuk ini.
// Contoh: mongodb://localhost:27017/todolistapp
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todolistapp';

// --- 3. Middleware ---
app.use(cors());
app.use(express.json());

// --- 4. Koneksi ke Database MongoDB ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Berhasil terhubung ke MongoDB');
    // Jalankan server HANYA setelah koneksi database berhasil
    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`API akan tersedia untuk domain: fidodating.xyz (via CORS)`);
    });
  })
  .catch(err => {
    console.error('❌ Gagal terhubung ke MongoDB', err);
    process.exit(1); // Keluar dari proses jika tidak bisa terhubung ke DB
  });

// --- 5. Skema & Model Mongoose ---
// Skema mendefinisikan struktur dokumen di dalam collection MongoDB.

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Judul wajib ada
  },
  notes: {
    type: String,
    default: '', // Nilai default jika tidak diisi
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// MongoDB secara otomatis akan menggunakan nama 'todos' (bentuk jamak dari 'Todo')
// sebagai nama collection di database.
const Todo = mongoose.model('Todo', todoSchema);


// --- 6. Definisi Rute (API Endpoints) dengan Logika MongoDB ---
// Semua fungsi handler diubah menjadi async/await untuk menangani operasi database.

// GET /api/todos -> Mendapatkan semua tugas
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 }); // Ambil semua data & urutkan dari yang terbaru
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// POST /api/todos -> Membuat tugas baru
app.post('/api/todos', async (req, res) => {
  try {
    const { title, notes } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Judul tugas tidak boleh kosong' });
    }

    // Buat dokumen baru menggunakan Model Todo
    const newTodo = new Todo({
      title,
      notes,
    });

    const savedTodo = await newTodo.save(); // Simpan ke database
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// PUT /api/todos/:id -> Mengupdate tugas
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, notes, completed } = req.body;

    // Cari dan update todo berdasarkan ID.
    // { new: true } akan mengembalikan dokumen yang sudah diupdate.
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, notes, completed },
      { new: true, runValidators: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// DELETE /api/todos/:id -> Menghapus tugas
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    res.status(204).send(); // Sukses, tidak ada konten yang dikembalikan
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

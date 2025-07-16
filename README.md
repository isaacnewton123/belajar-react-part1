# Backend Aplikasi Manajemen Tugas

Backend ini menyediakan API RESTful untuk aplikasi manajemen tugas, dibangun dengan Node.js, Express.js, dan MongoDB. Ini mendukung fungsionalitas otentikasi pengguna, serta operasi CRUD (Create, Read, Update, Delete) untuk kategori dan tugas.

---

## Daftar Isi

1.  [Fitur](#1-fitur)
2.  [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3.  [Persyaratan](#3-persyaratan)
4.  [Setup dan Instalasi](#4-setup-dan-instalasi)
5.  [Struktur Database (MongoDB Schema)](#5-struktur-database-mongodb-schema)
6.  [Dokumentasi API](#6-dokumentasi-api)
    * [Autentikasi](#autentikasi)
    * [Kategori](#kategori)
    * [Tugas](#tugas)
7.  [Menjalankan Aplikasi](#7-menjalankan-aplikasi)

---

### 1. Fitur

* **Autentikasi Pengguna:** Registrasi dan Login menggunakan JWT (JSON Web Tokens).
* **Manajemen Kategori:** Membuat, melihat, mengedit, dan menghapus kategori tugas. Setiap kategori terkait dengan pengguna tertentu.
* **Manajemen Tugas:** Membuat, melihat, mengedit, dan menghapus tugas. Tugas dapat dikaitkan dengan kategori dan pengguna.
* **Filter Tugas:** Memfilter tugas berdasarkan kategori dan status selesai.

---

### 2. Teknologi yang Digunakan

* **Node.js:** Lingkungan runtime JavaScript.
* **Express.js:** Framework web untuk Node.js.
* **MongoDB:** Database NoSQL.
* **Mongoose:** ODM (Object Data Modeling) untuk MongoDB.
* **bcryptjs:** Untuk hashing password.
* **jsonwebtoken:** Untuk otentikasi berbasis token.
* **cors:** Middleware untuk mengizinkan permintaan lintas domain.
* **dotenv:** Untuk memuat variabel lingkungan dari file `.env`.

---

### 3. Persyaratan

* Node.js (versi 14 atau lebih baru)
* npm (Node Package Manager) atau Yarn
* MongoDB (terinstal secara lokal atau menggunakan layanan cloud seperti MongoDB Atlas)

---

### 4. Setup dan Instalasi

Ikuti langkah-langkah di bawah ini untuk menyiapkan dan menjalankan backend secara lokal:

1.  **Kloning repositori (jika ada) atau buat folder proyek baru:**
    ```bash
    mkdir task-manager-backend
    cd task-manager-backend
    ```

2.  **Buat file `server.js`** dan salin kode backend yang telah disediakan sebelumnya ke dalamnya.

3.  **Buat file `.env`** di root folder proyek Anda dan tambahkan konfigurasi berikut:
    ```env
    MONGO_URI=mongodb://localhost:27017/taskmanager_db
    JWT_SECRET=YOUR_SUPER_SECURE_AND_LONG_RANDOM_SECRET_KEY
    PORT=5000
    ```
    * **`MONGO_URI`**: Ganti dengan URI koneksi MongoDB Anda (misalnya, dari MongoDB Atlas). Jika Anda menggunakan MongoDB lokal, `mongodb://localhost:27017/taskmanager_db` sudah cukup.
    * **`JWT_SECRET`**: **Sangat penting** untuk mengganti ini dengan string acak yang panjang dan kompleks. Ini digunakan untuk menandatangani dan memverifikasi token JWT.
    * **`PORT`**: Port di mana server akan berjalan.

4.  **Instal dependensi:** Buka terminal di root folder proyek Anda dan jalankan perintah berikut:
    ```bash
    npm install express mongoose bcryptjs jsonwebtoken cors dotenv
    ```
    Atau jika menggunakan Yarn:
    ```bash
    yarn add express mongoose bcryptjs jsonwebtoken cors dotenv
    ```

---

### 5. Struktur Database (MongoDB Schema)

Backend ini menggunakan tiga koleksi (collections) utama di MongoDB:

* **`users`**:
    * `username`: `String`, unik, wajib.
    * `password`: `String`, di-hash, wajib.
* **`categories`**:
    * `name`: `String`, unik, wajib.
    * `user`: `ObjectId` (referensi ke `users`), wajib.
* **`tasks`**:
    * `title`: `String`, wajib.
    * `description`: `String`, opsional.
    * `completed`: `Boolean`, default `false`.
    * `category`: `ObjectId` (referensi ke `categories`), opsional.
    * `user`: `ObjectId` (referensi ke `users`), wajib.
    * `createdAt`: `Date`, otomatis diisi saat pembuatan.

---

### 6. Dokumentasi API

Semua endpoint yang memerlukan otentikasi harus menyertakan header `Authorization`.

#### Header Permintaan Umum (untuk endpoint yang dilindungi):

---

#### Autentikasi

1.  **Registrasi Pengguna Baru**
    * **URL:** `/api/register`
    * **Metode:** `POST`
    * **Deskripsi:** Mendaftarkan pengguna baru. Password akan di-hash sebelum disimpan.
    * **Body Permintaan (JSON):**
        ```json
        {
          "username": "nama_pengguna_baru",
          "password": "password_aman"
        }
        ```
    * **Respon Sukses (201 Created):**
        ```json
        {
          "message": "Pengguna berhasil terdaftar."
        }
        ```
    * **Respon Error (400 Bad Request):**
        ```json
        {
          "message": "Nama pengguna sudah ada." // Jika username duplikat
        }
        ```
        (500 Internal Server Error untuk kesalahan server lainnya)

2.  **Login Pengguna**
    * **URL:** `/api/login`
    * **Metode:** `POST`
    * **Deskripsi:** Mengautentikasi pengguna dan mengembalikan token JWT.
    * **Body Permintaan (JSON):**
        ```json
        {
          "username": "nama_pengguna",
          "password": "password_anda"
        }
        ```
    * **Respon Sukses (200 OK):**
        ```json
        {
          "message": "Login berhasil!",
          "token": "eyJhbGciOiJIUzI1Ni...", // Token JWT yang akan digunakan untuk permintaan selanjutnya
          "userId": "60d5ec49f8c...", // ID pengguna
          "username": "nama_pengguna"
        }
        ```
    * **Respon Error (400 Bad Request):**
        ```json
        {
          "message": "Nama pengguna atau password salah."
        }
        ```
        (500 Internal Server Error untuk kesalahan server lainnya)

---

#### Kategori (Membutuhkan Autentikasi)

1.  **Mendapatkan Semua Kategori**
    * **URL:** `/api/categories`
    * **Metode:** `GET`
    * **Deskripsi:** Mengambil semua kategori yang dibuat oleh pengguna yang terautentikasi.
    * **Respon Sukses (200 OK):**
        ```json
        [
          {
            "_id": "60d5ec49f8c...",
            "name": "Pribadi",
            "user": "60d5ec49f8c...",
            "__v": 0
          },
          {
            "_id": "60d5ec49f8c...",
            "name": "Pekerjaan",
            "user": "60d5ec49f8c...",
            "__v": 0
          }
        ]
        ```
    * **Respon Error (401 Unauthorized / 403 Forbidden):** Jika token tidak valid atau tidak ada.

2.  **Membuat Kategori Baru**
    * **URL:** `/api/categories`
    * **Metode:** `POST`
    * **Deskripsi:** Membuat kategori baru untuk pengguna yang terautentikasi.
    * **Body Permintaan (JSON):**
        ```json
        {
          "name": "Kategori Baru Saya"
        }
        ```
    * **Respon Sukses (201 Created):**
        ```json
        {
          "_id": "60d5ec49f8c...",
          "name": "Kategori Baru Saya",
          "user": "60d5ec49f8c...",
          "__v": 0
        }
        ```
    * **Respon Error (400 Bad Request):** Jika nama kategori sudah ada.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

3.  **Mengupdate Kategori**
    * **URL:** `/api/categories/:id` (Ganti `:id` dengan ID kategori)
    * **Metode:** `PUT`
    * **Deskripsi:** Mengupdate nama kategori berdasarkan ID.
    * **Body Permintaan (JSON):**
        ```json
        {
          "name": "Nama Kategori Diubah"
        }
        ```
    * **Respon Sukses (200 OK):**
        ```json
        {
          "_id": "60d5ec49f8c...",
          "name": "Nama Kategori Diubah",
          "user": "60d5ec49f8c...",
          "__v": 0
        }
        ```
    * **Respon Error (404 Not Found):** Jika kategori tidak ditemukan atau bukan milik pengguna.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

4.  **Menghapus Kategori**
    * **URL:** `/api/categories/:id` (Ganti `:id` dengan ID kategori)
    * **Metode:** `DELETE`
    * **Deskripsi:** Menghapus kategori berdasarkan ID.
    * **Respon Sukses (200 OK):**
        ```json
        {
          "message": "Kategori berhasil dihapus."
        }
        ```
    * **Respon Error (404 Not Found):** Jika kategori tidak ditemukan atau bukan milik pengguna.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

---

#### Tugas (Membutuhkan Autentikasi)

1.  **Mendapatkan Semua Tugas**
    * **URL:** `/api/tasks`
    * **Metode:** `GET`
    * **Deskripsi:** Mengambil semua tugas untuk pengguna yang terautentikasi. Mendukung filter opsional.
    * **Query Params Opsional:**
        * `categoryId`: Filter tugas berdasarkan ID kategori.
        * `completed`: Filter tugas berdasarkan status selesai (`true` atau `false`).
    * **Contoh URL dengan Query Params:** `/api/tasks?categoryId=60d5ec49f8c...&completed=false`
    * **Respon Sukses (200 OK):**
        ```json
        [
          {
            "_id": "60d5ec49f8c...",
            "title": "Belajar React Hooks",
            "description": "Mendalami Custom Hooks dan Context API.",
            "completed": false,
            "category": { // Objek kategori akan di-populate jika ada
              "_id": "60d5ec49f8c...",
              "name": "Pekerjaan"
            },
            "user": "60d5ec49f8c...",
            "createdAt": "2023-07-16T10:00:00.000Z",
            "__v": 0
          }
        ]
        ```
    * **Respon Error (401 Unauthorized / 403 Forbidden):** Jika token tidak valid atau tidak ada.

2.  **Membuat Tugas Baru**
    * **URL:** `/api/tasks`
    * **Metode:** `POST`
    * **Deskripsi:** Membuat tugas baru untuk pengguna yang terautentikasi.
    * **Body Permintaan (JSON):**
        ```json
        {
          "title": "Beli Bahan Makanan",
          "description": "Telur, susu, roti.",
          "categoryId": "60d5ec49f8c..." // Opsional, ID kategori
        }
        ```
    * **Respon Sukses (201 Created):**
        ```json
        {
          "_id": "60d5ec49f8c...",
          "title": "Beli Bahan Makanan",
          "description": "Telur, susu, roti.",
          "completed": false,
          "category": { // Objek kategori akan di-populate jika ada
            "_id": "60d5ec49f8c...",
            "name": "Pribadi"
          },
          "user": "60d5ec49f8c...",
          "createdAt": "2023-07-16T10:00:00.000Z",
          "__v": 0
        }
        ```
    * **Respon Error (500 Internal Server Error):** Untuk kesalahan server.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

3.  **Mendapatkan Tugas Berdasarkan ID**
    * **URL:** `/api/tasks/:id` (Ganti `:id` dengan ID tugas)
    * **Metode:** `GET`
    * **Deskripsi:** Mengambil detail satu tugas berdasarkan ID-nya.
    * **Respon Sukses (200 OK):** (Struktur sama seperti di atas, tapi hanya satu objek tugas)
    * **Respon Error (404 Not Found):** Jika tugas tidak ditemukan atau bukan milik pengguna.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

4.  **Mengupdate Tugas**
    * **URL:** `/api/tasks/:id` (Ganti `:id` dengan ID tugas)
    * **Metode:** `PUT`
    * **Deskripsi:** Mengupdate detail tugas berdasarkan ID. Properti yang tidak disertakan dalam body permintaan tidak akan diubah.
    * **Body Permintaan (JSON):** (Semua properti opsional, hanya kirim yang ingin diubah)
        ```json
        {
          "title": "Selesaikan Laporan Proyek",
          "description": "Revisi bagian kesimpulan.",
          "completed": true,
          "categoryId": "60d5ec49f8c..." // Opsional, bisa diubah atau dihapus (set ke null)
        }
        ```
    * **Respon Sukses (200 OK):** (Struktur sama seperti di atas, tapi dengan data yang diupdate)
    * **Respon Error (404 Not Found):** Jika tugas tidak ditemukan atau bukan milik pengguna.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

5.  **Menghapus Tugas**
    * **URL:** `/api/tasks/:id` (Ganti `:id` dengan ID tugas)
    * **Metode:** `DELETE`
    * **Deskripsi:** Menghapus tugas berdasarkan ID.
    * **Respon Sukses (200 OK):**
        ```json
        {
          "message": "Tugas berhasil dihapus."
        }
        ```
    * **Respon Error (404 Not Found):** Jika tugas tidak ditemukan atau bukan milik pengguna.
        (401 Unauthorized / 403 Forbidden untuk masalah token)

---

### 7. Menjalankan Aplikasi

Setelah semua dependensi terinstal dan file `.env` dikonfigurasi, Anda dapat menjalankan server backend dengan perintah berikut di terminal dari root folder proyek:

```bash
node server.js
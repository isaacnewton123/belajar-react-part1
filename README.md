# Backend Mini Media Sosial

Backend ini menyediakan API RESTful untuk mini media sosial sederhana, dibangun dengan Node.js, Express.js, dan MongoDB. Backend ini dirancang untuk membantu Anda belajar frontend React lebih dalam dengan menyediakan fitur dasar seperti autentikasi pengguna, posting status, dan komentar.

---

**Base URL**

- **Domain:** `http://localhost:8080` (atau domain Anda jika di-deploy)

Semua request dan response body menggunakan format `JSON`.

---

## Daftar Isi

1. [Fitur](#1-fitur)
2. [Teknologi yang Digunakan](#2-teknologi-yang-digunakan)
3. [Persyaratan](#3-persyaratan)
4. [Setup dan Instalasi](#4-setup-dan-instalasi)
5. [Struktur Database (MongoDB Schema)](#5-struktur-database-mongodb-schema)
6. [Dokumentasi API](#6-dokumentasi-api)
   - [Autentikasi](#autentikasi)
   - [Posting Status](#posting-status)
   - [Komentar](#komentar)
   - [Profil Pengguna](#profil-pengguna)
7. [Menjalankan Aplikasi](#7-menjalankan-aplikasi)

---

### 1. Fitur

- **Autentikasi Pengguna:** Registrasi dan login menggunakan JWT.
- **Posting Status:** Membuat, melihat, dan menghapus posting status.
- **Komentar:** Menambahkan dan melihat komentar pada posting.
- **Profil Pengguna:** Melihat informasi dasar pengguna.

---

### 2. Teknologi yang Digunakan

- **Node.js:** Runtime JavaScript.
- **Express.js:** Framework web untuk Node.js.
- **MongoDB:** Database NoSQL.
- **Mongoose:** ODM untuk MongoDB.
- **bcryptjs:** Hashing password.
- **jsonwebtoken:** Otentikasi berbasis token.
- **cors:** Mengizinkan permintaan lintas domain.
- **dotenv:** Mengelola variabel lingkungan.

---

### 3. Persyaratan

- Node.js (versi 14 atau lebih baru)
- npm atau Yarn
- MongoDB (lokal atau MongoDB Atlas)

---

### 4. Setup dan Instalasi

1. **Buat folder proyek baru:**
   ```bash
   mkdir mini-social-backend
   cd mini-social-backend
   ```

2. **Buat file `server.js`** dan salin kode backend yang disediakan ke dalamnya.

3. **Buat file `.env`** di root folder proyek:
   ```env
   MONGO_URI=mongodb://localhost:27017/mini_social_db
   JWT_SECRET=YOUR_VERY_SECURE_SECRET_KEY
   PORT=8080
   ```
   - Ganti `MONGO_URI` dengan URI MongoDB Anda.
   - Ganti `JWT_SECRET` dengan string acak yang panjang dan aman.

4. **Instal dependensi:**
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken cors dotenv
   ```

---

### 5. Struktur Database (MongoDB Schema)

- **`users`**:
  - `username`: `String`, unik, wajib.
  - `password`: `String`, di-hash, wajib.
  - `name`: `String`, wajib.
  - `bio`: `String`, default kosong.
- **`posts`**:
  - `content`: `String`, wajib.
  - `user`: `ObjectId` (ref ke `users`), wajib.
  - `createdAt`: `Date`, otomatis.
- **`comments`**:
  - `content`: `String`, wajib.
  - `user`: `ObjectId` (ref ke `users`), wajib.
  - `post`: `ObjectId` (ref ke `posts`), wajib.
  - `createdAt`: `Date`, otomatis.

---

### 6. Dokumentasi API

Endpoint yang memerlukan otentikasi harus menyertakan header `Authorization: Bearer <token>`.

#### Autentikasi

1. **Registrasi Pengguna**
   - **URL:** `/api/register`
   - **Metode:** `POST`
   - **Body:**
     ```json
     {
       "username": "user1",
       "password": "pass123",
       "name": "User Satu"
     }
     ```
   - **Respon Sukses (201):**
     ```json
     { "message": "Pengguna berhasil terdaftar." }
     ```

2. **Login Pengguna**
   - **URL:** `/api/login`
   - **Metode:** `POST`
   - **Body:**
     ```json
     {
       "username": "user1",
       "password": "pass123"
     }
     ```
   - **Respon Sukses (200):**
     ```json
     {
       "message": "Login berhasil!",
       "token": "jwt_token",
       "userId": "user_id",
       "username": "user1"
     }
     ```

#### Posting Status

1. **Mendapatkan Semua Posting**
   - **URL:** `/api/posts`
   - **Metode:** `GET`
   - **Respon Sukses (200):**
     ```json
     [
       {
         "_id": "post_id",
         "content": "Halo dunia!",
         "user": { "username": "user1", "name": "User Satu" },
         "createdAt": "2025-07-23T11:41:00.000Z"
       }
     ]
     ```

2. **Membuat Posting**
   - **URL:** `/api/posts`
   - **Metode:** `POST`
   - **Body:**
     ```json
     { "content": "Halo dunia!" }
     ```
   - **Respon Sukses (201):**
     ```json
     {
       "_id": "post_id",
       "content": "Halo dunia!",
       "user": { "username": "user1", "name": "User Satu" },
       "createdAt": "2025-07-23T11:41:00.000Z"
     }
     ```

3. **Menghapus Posting**
   - **URL:** `/api/posts/:id`
   - **Metode:** `DELETE`
   - **Respon Sukses (200):**
     ```json
     { "message": "Posting berhasil dihapus." }
     ```

#### Komentar

1. **Mendapatkan Komentar Posting**
   - **URL:** `/api/posts/:id/comments`
   - **Metode:** `GET`
   - **Respon Sukses (200):**
     ```json
     [
       {
         "_id": "comment_id",
         "content": "Keren!",
         "user": { "username": "user2", "name": "User Dua" },
         "post": "post_id",
         "createdAt": "2025-07-23T11:42:00.000Z"
       }
     ]
     ```

2. **Menambahkan Komentar**
   - **URL:** `/api/posts/:id/comments`
   - **Metode:** `POST`
   - **Body:**
     ```json
     { "content": "Keren!" }
     ```
   - **Respon Sukses (201):**
     ```json
     {
       "_id": "comment_id",
       "content": "Keren!",
       "user": { "username": "user2", "name": "User Dua" },
       "post": "post_id",
       "createdAt": "2025-07-23T11:42:00.000Z"
     }
     ```

#### Profil Pengguna

1. **Mendapatkan Profil Pengguna**
   - **URL:** `/api/users/:id`
   - **Metode:** `GET`
   - **Respon Sukses (200):**
     ```json
     {
       "_id": "user_id",
       "username": "user1",
       "name": "User Satu",
       "bio": "Suka belajar React"
     }
     ```

---

### 7. Menjalankan Aplikasi

Setelah setup selesai, jalankan server dengan:
```bash
node server.js
```

Server akan berjalan di `http://localhost:8080` (atau port yang Anda tentukan). Anda bisa mulai membangun frontend React untuk berinteraksi dengan API ini!
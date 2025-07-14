# Dokumentasi REST API Todo List (Versi MongoDB)

Dokumentasi ini menjelaskan setiap endpoint yang tersedia di backend aplikasi Todo List yang sudah terintegrasi dengan MongoDB.

**Base URL**

-   **Lokal:** `http://localhost:8080`
-   **Produksi:** `http://api.fidodating.xyz`

Semua request dan response body menggunakan format `JSON`.

---

## Objek Model

### Objek `Todo`

Objek ini merepresentasikan satu item tugas yang tersimpan di dalam collection MongoDB.

| Properti  | Tipe      | Deskripsi                                                                    |
| :-------- | :-------- | :--------------------------------------------------------------------------- |
| `_id`       | `string`  | ID unik untuk setiap tugas (dibuat otomatis oleh MongoDB).                 |
| `title`     | `string`  | Judul atau nama tugas (wajib diisi).                                         |
| `notes`     | `string`  | Catatan atau deskripsi tambahan untuk tugas (opsional).                      |
| `completed` | `boolean` | Status tugas, `true` jika selesai, `false` jika belum. Defaultnya adalah `false`. |
| `createdAt` | `string`  | Tanggal dan waktu saat tugas dibuat (format ISO 8601, dibuat otomatis).      |
| `__v`       | `number`  | Nomor versi dokumen (internal Mongoose, bisa diabaikan).                     |

---

## Endpoints

### 1. Mendapatkan Semua Tugas

Mengambil seluruh daftar tugas yang tersimpan, diurutkan dari yang paling baru.

-   **Method:** `GET`
-   **Endpoint:** `/api/todos`
-   **Body:** Tidak ada.

**Contoh Response (Success `200 OK`)**

```json
[
  {
    "_id": "64a5f3b4c3d4e5f6a7b8c9d0",
    "title": "Deploy aplikasi ke VPS",
    "notes": "Jangan lupa konfigurasi Nginx",
    "completed": false,
    "createdAt": "2025-07-14T12:00:30.000Z",
    "__v": 0
  },
  {
    "_id": "64a5f3a2c3d4e5f6a7b8c9c9",
    "title": "Belajar membuat backend",
    "notes": "Gunakan Node.js dan Express",
    "completed": true,
    "createdAt": "2025-07-14T12:00:00.000Z",
    "__v": 0
  }
]
```

**Contoh `curl`:**

```bash
curl http://localhost:8080/api/todos
```

---

### 2. Membuat Tugas Baru

Menambahkan satu tugas baru ke dalam daftar.

-   **Method:** `POST`
-   **Endpoint:** `/api/todos`

**Request Body**

| Properti | Tipe     | Wajib? | Deskripsi         |
| :------- | :------- | :----- | :---------------- |
| `title`  | `string` | **Ya** | Judul tugas baru. |
| `notes`  | `string` | Tidak  | Catatan tambahan. |

**Contoh Response (Success `201 Created`)**

```json
{
  "_id": "64a5f3c5c3d4e5f6a7b8c9d1",
  "title": "Hubungkan Frontend ke Backend",
  "notes": "Gunakan Axios atau Fetch API",
  "completed": false,
  "createdAt": "2025-07-14T12:01:00.000Z",
  "__v": 0
}
```

**Contoh Response (Error `400 Bad Request`)**

```json
{
  "message": "Judul tugas tidak boleh kosong"
}
```

**Contoh `curl`:**

```bash
curl -X POST http://localhost:8080/api/todos \
-H "Content-Type: application/json" \
-d '{"title": "Hubungkan Frontend ke Backend", "notes": "Gunakan Axios atau Fetch API"}'
```

---

### 3. Memperbarui Tugas

Mengubah data dari sebuah tugas yang sudah ada berdasarkan `_id`-nya.

-   **Method:** `PUT`
-   **Endpoint:** `/api/todos/:id`
-   **URL Parameter:** `id` (ID dari tugas yang akan diupdate).

**Request Body** (Kirim hanya properti yang ingin diubah)

| Properti    | Tipe      | Wajib? | Deskripsi                |
| :---------- | :-------- | :----- | :----------------------- |
| `title`     | `string`  | Tidak  | Judul tugas yang baru.   |
| `notes`     | `string`  | Tidak  | Catatan yang baru.       |
| `completed` | `boolean` | Tidak  | Status selesai yang baru.|

**Contoh Response (Success `200 OK`)**

```json
{
  "_id": "64a5f3c5c3d4e5f6a7b8c9d1",
  "title": "Hubungkan Frontend ke Backend",
  "notes": "Gunakan Axios atau Fetch API",
  "completed": true,
  "createdAt": "2025-07-14T12:01:00.000Z",
  "__v": 0
}
```

**Contoh Response (Error `404 Not Found`)**

```json
{
  "message": "Tugas tidak ditemukan"
}
```

**Contoh `curl` (Menandai tugas sebagai selesai):**

```bash
curl -X PUT http://localhost:8080/api/todos/64a5f3c5c3d4e5f6a7b8c9d1 \
-H "Content-Type: application/json" \
-d '{"completed": true}'
```

---

### 4. Menghapus Tugas

Menghapus sebuah tugas dari daftar berdasarkan `_id`-nya.

-   **Method:** `DELETE`
-   **Endpoint:** `/api/todos/:id`
-   **URL Parameter:** `id` (ID dari tugas yang akan dihapus).

**Contoh Response (Success `204 No Content`)**

-   Tidak ada body response, hanya status `204` yang menandakan operasi berhasil.

**Contoh Response (Error `404 Not Found`)**

```json
{
  "message": "Tugas tidak ditemukan"
}
```

**Contoh `curl`:**

```bash
curl -X DELETE http://localhost:8080/api/todos/64a5f3c5c3d4e5f6a7b8c9d1

# Mini Social Media Backend API

Backend API untuk aplikasi mini media sosial yang dibangun dengan Node.js, Express, dan JWT authentication. API ini menyediakan fitur-fitur lengkap untuk pembelajaran frontend React.

## 🚀 Fitur Utama

- **Authentication**: Register, Login dengan JWT
- **User Management**: Profile, Upload Avatar, Edit Profile
- **Posts**: Create, Read, Delete Posts dengan Image Upload
- **Social Features**: Like/Unlike Posts, Comments, Follow/Unfollow Users
- **Feed**: Timeline dari user yang difollow
- **Search**: Pencarian user berdasarkan username/nama
- **File Upload**: Upload gambar untuk avatar dan posts

## 📋 Prasyarat

Pastikan kamu sudah menginstall:
- Node.js (versi 14 atau lebih baru)
- npm atau yarn

## ⚡ Instalasi

1. **Clone atau download project ini**
```bash
mkdir mini-social-backend
cd mini-social-backend
```

2. **Buat file server.js dan package.json** (copy dari kode yang sudah dibuat)

3. **Install dependencies**
```bash
npm install
```

4. **Install nodemon untuk development (opsional)**
```bash
npm install -g nodemon
```

5. **Jalankan server**
```bash
# Production mode
npm start

# Development mode (dengan auto-reload)
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Headers
Untuk endpoint yang memerlukan authentication, sertakan header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "",
    "avatar": null,
    "followersCount": 0,
    "followingCount": 0,
    "postsCount": 0
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "bio": "",
    "avatar": null,
    "followersCount": 0,
    "followingCount": 0,
    "postsCount": 0
  }
}
```

---

## 👤 User Management

### Get Current User Profile
**GET** `/users/profile`
*Requires Authentication*

**Response:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "bio": "My bio here",
  "avatar": "avatar_filename.jpg",
  "followersCount": 10,
  "followingCount": 5,
  "postsCount": 3,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Profile
**PUT** `/users/profile`
*Requires Authentication*

**Request Body (FormData):**
- `fullName`: string (optional)
- `bio`: string (optional)
- `avatar`: file (optional, max 5MB, image only)

**Response:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "email": "john@example.com",
  "fullName": "John Doe Updated",
  "bio": "Updated bio",
  "avatar": "new_avatar.jpg",
  "followersCount": 10,
  "followingCount": 5,
  "postsCount": 3
}
```

### Get User by Username
**GET** `/users/:username`
*Requires Authentication*

**Response:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "fullName": "John Doe",
  "bio": "My bio here",
  "avatar": "avatar.jpg",
  "followersCount": 10,
  "followingCount": 5,
  "postsCount": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isFollowing": true
}
```

---

## 👥 Follow System

### Follow User
**POST** `/users/:userId/follow`
*Requires Authentication*

**Response:**
```json
{
  "message": "User followed successfully"
}
```

### Unfollow User
**DELETE** `/users/:userId/follow`
*Requires Authentication*

**Response:**
```json
{
  "message": "User unfollowed successfully"
}
```

---

## 📝 Posts

### Create Post
**POST** `/posts`
*Requires Authentication*

**Request Body (FormData):**
- `content`: string (required)
- `image`: file (optional, max 5MB, image only)

**Response:**
```json
{
  "id": "post_id",
  "userId": "user_id",
  "content": "This is my post content",
  "image": "post_image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "likesCount": 0,
  "commentsCount": 0,
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "avatar.jpg"
  },
  "isLiked": false
}
```

### Get All Posts
**GET** `/posts?page=1&limit=10`
*Requires Authentication*

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "userId": "user_id",
      "content": "Post content",
      "image": "image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 2,
      "user": {
        "id": "user_id",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "avatar.jpg"
      },
      "isLiked": true
    }
  ],
  "hasMore": true,
  "totalPosts": 50
}
```

### Get Single Post
**GET** `/posts/:postId`
*Requires Authentication*

### Delete Post
**DELETE** `/posts/:postId`
*Requires Authentication*

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

---

## ❤️ Likes

### Like Post
**POST** `/posts/:postId/like`
*Requires Authentication*

**Response:**
```json
{
  "message": "Post liked successfully"
}
```

### Unlike Post
**DELETE** `/posts/:postId/like`
*Requires Authentication*

**Response:**
```json
{
  "message": "Post unliked successfully"
}
```

---

## 💬 Comments

### Add Comment
**POST** `/posts/:postId/comments`
*Requires Authentication*

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

**Response:**
```json
{
  "id": "comment_id",
  "postId": "post_id",
  "userId": "user_id",
  "content": "This is a comment",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "avatar.jpg"
  }
}
```

### Get Post Comments
**GET** `/posts/:postId/comments`
*Requires Authentication*

**Response:**
```json
{
  "comments": [
    {
      "id": "comment_id",
      "postId": "post_id",
      "userId": "user_id",
      "content": "This is a comment",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user_id",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "avatar.jpg"
      }
    }
  ]
}
```

### Delete Comment
**DELETE** `/comments/:commentId`
*Requires Authentication*

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## 🔍 Search

### Search Users
**GET** `/search/users?q=john`
*Requires Authentication*

**Query Parameters:**
- `q`: string (search query)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "avatar.jpg",
      "followersCount": 10
    }
  ]
}
```

---

## 📰 Feed

### Get Feed (Timeline)
**GET** `/feed?page=1&limit=10`
*Requires Authentication*

Menampilkan posts dari user yang difollow dan posts sendiri.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**
```json
{
  "posts": [
    {
      "id": "post_id",
      "userId": "user_id",
      "content": "Post content",
      "image": "image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 2,
      "user": {
        "id": "user_id",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "avatar.jpg"
      },
      "isLiked": true
    }
  ],
  "hasMore": true,
  "totalPosts": 25
}
```

---

## 📁 File Upload

### Avatar dan Post Images
- **Maksimal ukuran**: 5MB
- **Format yang didukung**: JPG, JPEG, PNG, GIF
- **Folder penyimpanan**: `/uploads`
- **URL akses**: `http://localhost:5000/uploads/filename.jpg`

---

## 🛠️ Error Responses

### 400 - Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 - Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 - Forbidden
```json
{
  "error": "Invalid token"
}
```

### 404 - Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "error": "Server error"
}
```

---

## 🧪 Testing dengan Frontend React

Berikut contoh penggunaan API di React:

### 1. Setup Axios
```bash
npm install axios
```

### 2. Create API Service
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData),
  getUserByUsername: (username) => api.get(`/users/${username}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

export const postAPI = {
  createPost: (formData) => api.post('/posts', formData),
  getPosts: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
};

export const commentAPI = {
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const searchAPI = {
  searchUsers: (query) => api.get(`/search/users?q=${query}`),
};

export const feedAPI = {
  getFeed: (page = 1, limit = 10) => api.get(`/feed?page=${page}&limit=${limit}`),
};

export default api;
```

### 3. Contoh Penggunaan di Component
```javascript
// src/components/Login.js
import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirect ke dashboard
    } catch (error) {
      console.error('Login failed:', error.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
```

---

## 📝 Catatan Pengembangan

### In-Memory Database
API ini menggunakan in-memory storage (array JavaScript) untuk menyimpan data. Data akan hilang saat server restart. Untuk production, gunakan database seperti:
- MongoDB dengan Mongoose
- PostgreSQL dengan Sequelize
- MySQL dengan Sequelize

### Environment Variables
Untuk production, buat file `.env`:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

### Struktur Folder yang Disarankan
```
mini-social-backend/
├── server.js
├── package.json
├── README.md
├── .env
├── .gitignore
└── uploads/
    ├── (avatar files)
    └── (post images)
```

### File .gitignore
```
node_modules/
.env
uploads/*
!uploads/.gitkeep
*.log
```

---

## 🚀 Deployment

### Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `git push heroku main`
4. Set environment variables di Heroku dashboard

### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

---

## 🔄 Pengembangan Selanjutnya

Fitur yang bisa ditambahkan:
- Real-time notifications dengan Socket.io
- Story/Status feature
- Direct messaging
- Post categories/hashtags
- Image filters
- Push notifications
- Email verification
- Password reset
- Rate limiting
- Input validation dengan Joi
- Unit testing dengan Jest
- API documentation dengan Swagger

---

## 🐛 Troubleshooting

### CORS Error
Pastikan frontend berjalan di port yang diizinkan atau update konfigurasi CORS di server.js

### File Upload Error
Pastikan folder `uploads` ada dan memiliki permission yang benar.

### JWT Token Invalid
Periksa apakah token disimpan dengan benar di localStorage dan dikirim di header Authorization.

---

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat GitHub issue atau hubungi developer.

## 📄 License

MIT License - bebas digunakan untuk pembelajaran dan pengembangan.

---

**Happy Coding! 🎉**

Semoga backend API ini membantu dalam pembelajaran React kamu. Jangan lupa untuk eksplorasi dan kembangkan fitur-fitur tambahan!
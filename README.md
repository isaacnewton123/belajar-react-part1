# Mini Social Media Backend API (MongoDB Version)

Backend API untuk aplikasi mini media sosial yang dibangun dengan Node.js, Express, MongoDB, dan JWT authentication. API ini menyediakan fitur-fitur lengkap untuk pembelajaran frontend React.

## 🚀 Fitur Utama

- **Authentication**: Register, Login dengan JWT
- **User Management**: Profile, Upload Avatar, Edit Profile
- **Posts**: Create, Read, Delete Posts dengan Image Upload
- **Social Features**: Like/Unlike Posts, Comments, Follow/Unfollow Users
- **Feed**: Timeline dari user yang difollow
- **Search**: Pencarian user berdasarkan username/nama
- **File Upload**: Upload gambar untuk avatar dan posts
- **Database**: MongoDB dengan Mongoose ODM

## 📋 Prasyarat

Pastikan kamu sudah menginstall:

- Node.js (versi 14 atau lebih baru)
- MongoDB (local atau cloud seperti MongoDB Atlas)
- npm atau yarn

## 🗄️ Setup MongoDB

### Option 1: MongoDB Local

1. **Install MongoDB** di komputer kamu
2. **Jalankan MongoDB service**

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Option 2: MongoDB Atlas (Cloud)

1. Buat akun di [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Buat cluster gratis
3. Dapatkan connection string
4. Ganti `MONGODB_URI` di file `.env`

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

4. **Buat file .env** (opsional)

```bash
# .env
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-here
MONGODB_URI=mongodb://localhost:27017/mini-social-media

# Jika pakai MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-social-media
```

5. **Jalankan server**

```bash
# Production mode
npm start

# Development mode (dengan auto-reload)
npm run dev
```

Server akan berjalan di `https://fidodating.xyz`

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  bio: String (default: ""),
  avatar: String (filename),
  followersCount: Number (default: 0),
  followingCount: Number (default: 0),
  postsCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  content: String (required),
  image: String (filename),
  likesCount: Number (default: 0),
  commentsCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Comments Collection

```javascript
{
  _id: ObjectId,
  postId: ObjectId (ref: Post),
  userId: ObjectId (ref: User),
  content: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Likes Collection

```javascript
{
  _id: ObjectId,
  postId: ObjectId (ref: Post),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Follows Collection

```javascript
{
  _id: ObjectId,
  followerId: ObjectId (ref: User),
  followingId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 📚 API Documentation

### Base URL

```
https://fidodating.xyz/api
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
    "id": "507f1f77bcf86cd799439011",
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
    "id": "507f1f77bcf86cd799439011",
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
_Requires Authentication_

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
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
_Requires Authentication_

**Request Body (FormData):**

- `fullName`: string (optional)
- `bio`: string (optional)
- `avatar`: file (optional, max 5MB, image only)

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
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
_Requires Authentication_

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
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
_Requires Authentication_

**Response:**

```json
{
  "message": "User followed successfully"
}
```

### Unfollow User

**DELETE** `/users/:userId/follow`
_Requires Authentication_

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
_Requires Authentication_

**Request Body (FormData):**

- `content`: string (required)
- `image`: file (optional, max 5MB, image only)

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "content": "This is my post content",
  "image": "post_image.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "likesCount": 0,
  "commentsCount": 0,
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "avatar.jpg"
  },
  "isLiked": false
}
```

### Get All Posts

**GET** `/posts?page=1&limit=10`
_Requires Authentication_

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**

```json
{
  "posts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "content": "Post content",
      "image": "image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 2,
      "user": {
        "id": "507f1f77bcf86cd799439012",
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
_Requires Authentication_

### Delete Post

**DELETE** `/posts/:postId`
_Requires Authentication_

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
_Requires Authentication_

**Response:**

```json
{
  "message": "Post liked successfully"
}
```

### Unlike Post

**DELETE** `/posts/:postId/like`
_Requires Authentication_

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
_Requires Authentication_

**Request Body:**

```json
{
  "content": "This is a comment"
}
```

**Response:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "postId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "content": "This is a comment",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "avatar.jpg"
  }
}
```

### Get Post Comments

**GET** `/posts/:postId/comments`
_Requires Authentication_

**Response:**

```json
{
  "comments": [
    {
      "id": "507f1f77bcf86cd799439011",
      "postId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439013",
      "content": "This is a comment",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "507f1f77bcf86cd799439013",
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
_Requires Authentication_

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
_Requires Authentication_

**Query Parameters:**

- `q`: string (search query)

**Response:**

```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
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
_Requires Authentication_

Menampilkan posts dari user yang difollow dan posts sendiri.

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response:**

```json
{
  "posts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "content": "Post content",
      "image": "image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 2,
      "user": {
        "id": "507f1f77bcf86cd799439012",
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
- **URL akses**: `https://fidodating.xyz/uploads/filename.jpg`

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
import axios from "axios";

const API_BASE_URL = "https://fidodating.xyz/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (formData) => api.put("/users/profile", formData),
  getUserByUsername: (username) => api.get(`/users/${username}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

export const postAPI = {
  createPost: (formData) => api.post("/posts", formData),
  getPosts: (page = 1, limit = 10) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
};

export const commentAPI = {
  addComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const searchAPI = {
  searchUsers: (query) => api.get(`/search/users?q=${query}`),
};

export const feedAPI = {
  getFeed: (page = 1, limit = 10) =>
    api.get(`/feed?page=${page}&limit=${limit}`),
};

export default api;
```

### 3. Context untuk State Management

```javascript
// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 4. Contoh Component Login

```javascript
// src/components/Login.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### 5. Contoh Hook untuk Posts

```javascript
// src/hooks/usePosts.js
import { useState, useEffect } from "react";
import { postAPI } from "../services/api";

export const usePosts = (page = 1, limit = 10) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await postAPI.getPosts(pageNum, limit);
      const { posts: newPosts, hasMore: moreAvailable } = response.data;

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(moreAvailable);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = Math.floor(posts.length / limit) + 1;
      fetchPosts(nextPage, false);
    }
  };

  const likePost = async (postId) => {
    try {
      await postAPI.likePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const unlikePost = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to unlike post:", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      await postAPI.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    likePost,
    unlikePost,
    deletePost,
    refetch: () => fetchPosts(1, true),
  };
};
```

---

## 🚀 MongoDB Performance Tips

### Indexes untuk Performance

Backend sudah include beberapa indexes:

- Unique index pada `likes` collection untuk prevent duplicate likes
- Unique index pada `follows` collection untuk prevent duplicate follows
- Compound indexes untuk query optimization

### Tambahan Indexes (Optional)

Tambahkan di MongoDB Compass atau shell:

```javascript
// Index untuk search users
db.users.createIndex({ username: "text", fullName: "text" });

// Index untuk posts sorting
db.posts.createIndex({ createdAt: -1 });

// Index untuk user posts
db.posts.createIndex({ userId: 1, createdAt: -1 });

// Index untuk comments
db.comments.createIndex({ postId: 1, createdAt: 1 });
```

---

## 🔧 Environment Variables

Buat file `.env` untuk konfigurasi:

```bash
# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mini-social-media

# Untuk MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-social-media?retryWrites=true&w=majority

# File Upload Configuration (Optional)
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

---

## 📁 Struktur Project

```
mini-social-backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── README.md             # Documentation
└── uploads/              # Uploaded files
    ├── .gitkeep          # Keep folder in git
    ├── avatars/          # User avatars
    └── posts/            # Post images
```

### .gitignore

```
node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
uploads/*
!uploads/.gitkeep
*.log
.DS_Store
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl status mongod

# Check connection string
node -e "console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-social-media')"
```

### Common Errors

**Error: MongooseError: Operation buffering timed out**

- Solution: Check MongoDB connection string dan pastikan MongoDB service running

**Error: E11000 duplicate key error**

- Solution: User/email sudah exist, ini normal validation error

**Error: ValidationError**

- Solution: Check required fields di request body

**Error: CastError**

- Solution: Invalid ObjectId format, pastikan ID valid

---

## 🔄 Data Seeding (Optional)

Untuk testing, bisa buat script seeding data:

```javascript
// seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models (copy dari server.js)
// ... models here ...

const seedData = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/mini-social-media");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Follow.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = await User.insertMany([
      {
        username: "john_doe",
        email: "john@example.com",
        password: hashedPassword,
        fullName: "John Doe",
        bio: "Hello, I am John!",
      },
      {
        username: "jane_doe",
        email: "jane@example.com",
        password: hashedPassword,
        fullName: "Jane Doe",
        bio: "Hi there, I am Jane!",
      },
    ]);

    // Create sample posts
    await Post.insertMany([
      {
        userId: users[0]._id,
        content: "Hello world! This is my first post.",
      },
      {
        userId: users[1]._id,
        content: "Beautiful day today! 🌞",
      },
    ]);

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedData();
```

Run seeding:

```bash
node seed.js
```

---

## 🚀 Deployment

### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login dan create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set MONGODB_URI=your-mongodb-atlas-uri

# Deploy
git add .
git commit -m "Initial deployment"
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Set environment variables di dashboard
3. Deploy automatically dari git push

### Render

1. Connect repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

---

## 📈 Monitoring & Debugging

### Logging Enhancement

Tambahkan di server.js:

```javascript
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Error logging
app.use((error, req, res, next) => {
  console.error(`Error ${new Date().toISOString()}:`, error);
  // ... existing error handling
});
```

### MongoDB Queries Debugging

```javascript
// Enable mongoose debugging
mongoose.set("debug", true);
```

---

## 🎯 Pengembangan Selanjutnya

### Fitur yang Bisa Ditambahkan:

1. **Real-time Features** - Socket.io untuk notifications, chat
2. **Advanced Search** - Full-text search, hashtags, filters
3. **Media Support** - Video upload, multiple images
4. **Stories/Status** - Temporary posts yang expire
5. **Direct Messaging** - Private chat antar users
6. **Push Notifications** - Web notifications, email notifications
7. **Content Moderation** - Report system, admin dashboard
8. **Analytics** - User engagement, post insights
9. **API Rate Limiting** - Prevent spam dan abuse
10. **Caching** - Redis untuk better performance

### Security Enhancements:

- Input validation dengan Joi
- Rate limiting dengan express-rate-limit
- Helmet.js untuk security headers
- HTTPS enforcement
- Password complexity requirements
- Email verification
- Two-factor authentication

### Performance Optimizations:

- Database connection pooling
- Image compression dan resizing
- CDN untuk static files
- Database query optimization
- Pagination improvements
- Caching strategies

---

## 🧪 Testing

### Unit Testing dengan Jest

```bash
npm install --save-dev jest supertest mongodb-memory-server
```

Contoh test file:

```javascript
// tests/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth Endpoints", () => {
  test("Should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      fullName: "Test User",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.token).toBeDefined();
  });

  test("Should login with valid credentials", async () => {
    // First register a user
    await request(app).post("/api/auth/register").send({
      username: "logintest",
      email: "login@example.com",
      password: "password123",
      fullName: "Login Test",
    });

    // Then login
    const response = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBeDefined();
  });
});
```

### API Testing dengan Postman

Buat collection Postman dengan:

1. Environment variables (`{{baseUrl}}`, `{{token}}`)
2. Pre-request scripts untuk auth
3. Test scripts untuk validation
4. Automated test runs

---

## 📋 Best Practices

### Code Organization

```
src/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   └── commentController.js
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   └── index.js
├── middleware/
│   ├── auth.js
│   ├── upload.js
│   └── validation.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── posts.js
│   └── index.js
├── utils/
│   ├── database.js
│   ├── helpers.js
│   └── constants.js
└── server.js
```

### Error Handling

```javascript
// utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
```

### Input Validation

```javascript
// middleware/validation.js
const Joi = require("joi");

const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validatePost = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().min(1).max(2000).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateRegister,
  validatePost,
};
```

---

## 🔒 Security Checklist

### Authentication & Authorization

- ✅ JWT dengan secret yang kuat
- ✅ Password hashing dengan bcrypt
- ✅ Token expiration
- ⬜ Refresh token mechanism
- ⬜ Rate limiting untuk auth endpoints
- ⬜ Account lockout setelah failed attempts

### Input Validation

- ⬜ Joi validation untuk semua inputs
- ⬜ Sanitize HTML content
- ⬜ File upload validation
- ⬜ SQL injection prevention (tidak applicable untuk MongoDB)
- ⬜ NoSQL injection prevention

### Data Protection

- ⬜ Environment variables untuk secrets
- ⬜ HTTPS enforcement
- ⬜ Secure headers dengan Helmet
- ⬜ CORS configuration
- ⬜ Data encryption untuk sensitive info

---

## 📊 Performance Monitoring

### MongoDB Monitoring

```javascript
// Add to server.js
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});
```

### Performance Metrics

```javascript
// middleware/metrics.js
const responseTime = require("response-time");

app.use(
  responseTime((req, res, time) => {
    console.log(`${req.method} ${req.url} - ${time}ms`);
  })
);

// Memory usage monitoring
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log("Memory Usage:", {
    rss: Math.round(memUsage.rss / 1024 / 1024) + " MB",
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB",
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
  });
}, 30000); // Every 30 seconds
```

---

## 🎓 Learning Path untuk React

### Beginner Level

1. **Setup & Authentication**

   - Buat login/register forms
   - Implement JWT authentication
   - Protected routes dengan React Router
   - Context API untuk user state

2. **Basic CRUD Operations**
   - Display posts list
   - Create new post
   - Delete own posts
   - Basic error handling

### Intermediate Level

3. **Social Features**

   - Like/unlike posts
   - Add/delete comments
   - User profiles
   - Follow/unfollow users

4. **Advanced UI/UX**
   - Infinite scrolling
   - Image uploads dengan preview
   - Loading states
   - Optimistic updates

### Advanced Level

5. **Performance & Optimization**

   - React.memo dan useMemo
   - Code splitting
   - Image lazy loading
   - API caching dengan React Query

6. **Real-time Features**
   - WebSocket connections
   - Live notifications
   - Real-time comments
   - Online status

---

## 🛠️ Tools Recommendations

### Development Tools

- **Database**: MongoDB Compass untuk GUI
- **API Testing**: Postman atau Insomnia
- **Code Editor**: VS Code dengan extensions:
  - MongoDB for VS Code
  - Thunder Client
  - Prettier
  - ESLint

### Frontend Libraries (untuk React)

- **UI Framework**: Material-UI, Ant Design, atau Chakra UI
- **State Management**: Context API, Redux Toolkit, atau Zustand
- **HTTP Client**: Axios atau React Query
- **Form Handling**: Formik atau React Hook Form
- **Routing**: React Router
- **Image Upload**: react-dropzone
- **Infinite Scroll**: react-infinite-scroll-component

### Production Tools

- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: New Relic, DataDog
- **Logging**: Winston, Morgan
- **Database Hosting**: MongoDB Atlas

---

## 📞 Support & Community

### Dokumentasi Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)

### Community Help

- Stack Overflow untuk troubleshooting
- MongoDB Community Forums
- Express.js GitHub Issues
- React Community Discord

---

## 📄 Changelog

### Version 1.0.0

- Initial release dengan basic social media features
- MongoDB integration dengan Mongoose
- JWT authentication
- File upload support
- Complete CRUD operations
- User follow system
- Comments dan likes
- Search functionality
- Feed timeline
- Comprehensive API documentation

---

## 📜 License

MIT License

Copyright (c) 2024 Mini Social Media Backend

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- Express.js team untuk web framework yang powerful
- MongoDB team untuk database yang flexible
- Mongoose team untuk ODM yang excellent
- Node.js community untuk ecosystem yang amazing
- Semua developers yang berkontribusi ke open source

---

**Happy Coding with MongoDB! 🚀**

Backend API ini dirancang khusus untuk pembelajaran React dengan database MongoDB yang real. Dengan fitur-fitur lengkap dan dokumentasi yang comprehensive, kamu bisa fokus untuk mengembangkan skills React frontend sambil berinteraksi dengan backend yang realistis.

Jangan lupa untuk:

- ⭐ Star project ini jika helpful
- 🐛 Report bugs jika ada issues
- 💡 Suggest features untuk improvement
- 📚 Share dengan teman-teman yang lagi belajar

Selamat belajar dan semoga sukses dalam journey React development! 🎉# Mini Social Media Backend API

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

Server akan berjalan di `https://fidodating.xyz`

## 📚 API Documentation

### Base URL

```
https://fidodating.xyz/api
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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

**Response:**

```json
{
  "message": "User followed successfully"
}
```

### Unfollow User

**DELETE** `/users/:userId/follow`
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

### Delete Post

**DELETE** `/posts/:postId`
_Requires Authentication_

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
_Requires Authentication_

**Response:**

```json
{
  "message": "Post liked successfully"
}
```

### Unlike Post

**DELETE** `/posts/:postId/like`
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
_Requires Authentication_

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
- **URL akses**: `https://fidodating.xyz/uploads/filename.jpg`

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
import axios from "axios";

const API_BASE_URL = "https://fidodating.xyz/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (formData) => api.put("/users/profile", formData),
  getUserByUsername: (username) => api.get(`/users/${username}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

export const postAPI = {
  createPost: (formData) => api.post("/posts", formData),
  getPosts: (page = 1, limit = 10) =>
    api.get(`/posts?page=${page}&limit=${limit}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
};

export const commentAPI = {
  addComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const searchAPI = {
  searchUsers: (query) => api.get(`/search/users?q=${query}`),
};

export const feedAPI = {
  getFeed: (page = 1, limit = 10) =>
    api.get(`/feed?page=${page}&limit=${limit}`),
};

export default api;
```

### 3. Contoh Penggunaan di Component

```javascript
// src/components/Login.js
import React, { useState } from "react";
import { authAPI } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      // Redirect ke dashboard
    } catch (error) {
      console.error("Login failed:", error.response.data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
PORT=8080
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

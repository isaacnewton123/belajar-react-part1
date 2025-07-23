// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory database (in production, use a real database like MongoDB or PostgreSQL)
let users = [];
let posts = [];
let comments = [];
let likes = [];
let follows = [];

// Helper functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: generateId(),
      username,
      email,
      fullName,
      password: hashedPassword,
      bio: '',
      avatar: null,
      createdAt: new Date().toISOString(),
      followersCount: 0,
      followingCount: 0,
      postsCount: 0
    };

    users.push(user);

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/users/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    postsCount: user.postsCount,
    createdAt: user.createdAt
  });
});

app.put('/api/users/profile', authenticateToken, upload.single('avatar'), (req, res) => {
  const { fullName, bio } = req.body;
  const userIndex = users.findIndex(u => u.id === req.user.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (fullName) users[userIndex].fullName = fullName;
  if (bio !== undefined) users[userIndex].bio = bio;
  if (req.file) users[userIndex].avatar = req.file.filename;

  const user = users[userIndex];
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    postsCount: user.postsCount
  });
});

app.get('/api/users/:username', authenticateToken, (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const isFollowing = follows.some(f => f.followerId === req.user.id && f.followingId === user.id);

  res.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    bio: user.bio,
    avatar: user.avatar,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    postsCount: user.postsCount,
    createdAt: user.createdAt,
    isFollowing
  });
});

// Follow/Unfollow Routes
app.post('/api/users/:userId/follow', authenticateToken, (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const targetUser = users.find(u => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingFollow = follows.find(f => f.followerId === currentUserId && f.followingId === targetUserId);
  if (existingFollow) {
    return res.status(400).json({ error: 'Already following this user' });
  }

  follows.push({
    id: generateId(),
    followerId: currentUserId,
    followingId: targetUserId,
    createdAt: new Date().toISOString()
  });

  // Update counts
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  users[currentUserIndex].followingCount++;
  users[targetUserIndex].followersCount++;

  res.json({ message: 'User followed successfully' });
});

app.delete('/api/users/:userId/follow', authenticateToken, (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  const followIndex = follows.findIndex(f => f.followerId === currentUserId && f.followingId === targetUserId);
  if (followIndex === -1) {
    return res.status(400).json({ error: 'Not following this user' });
  }

  follows.splice(followIndex, 1);

  // Update counts
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  users[currentUserIndex].followingCount--;
  users[targetUserIndex].followersCount--;

  res.json({ message: 'User unfollowed successfully' });
});

// Post Routes
app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const post = {
    id: generateId(),
    userId: req.user.id,
    content,
    image: req.file ? req.file.filename : null,
    createdAt: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0
  };

  posts.unshift(post);

  // Update user posts count
  const userIndex = users.findIndex(u => u.id === req.user.id);
  users[userIndex].postsCount++;

  // Add user info to response
  const user = users[userIndex];
  res.status(201).json({
    ...post,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar
    },
    isLiked: false
  });
});

app.get('/api/posts', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const postsWithUserInfo = posts.slice(startIndex, endIndex).map(post => {
    const user = users.find(u => u.id === post.userId);
    const isLiked = likes.some(l => l.postId === post.id && l.userId === req.user.id);
    
    return {
      ...post,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      },
      isLiked
    };
  });

  res.json({
    posts: postsWithUserInfo,
    hasMore: endIndex < posts.length,
    totalPosts: posts.length
  });
});

app.get('/api/posts/:postId', authenticateToken, (req, res) => {
  const post = posts.find(p => p.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const user = users.find(u => u.id === post.userId);
  const isLiked = likes.some(l => l.postId === post.id && l.userId === req.user.id);

  res.json({
    ...post,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar
    },
    isLiked
  });
});

app.delete('/api/posts/:postId', authenticateToken, (req, res) => {
  const postIndex = posts.findIndex(p => p.id === req.params.postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = posts[postIndex];
  if (post.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this post' });
  }

  posts.splice(postIndex, 1);

  // Update user posts count
  const userIndex = users.findIndex(u => u.id === req.user.id);
  users[userIndex].postsCount--;

  // Remove associated likes and comments
  likes = likes.filter(l => l.postId !== req.params.postId);
  comments = comments.filter(c => c.postId !== req.params.postId);

  res.json({ message: 'Post deleted successfully' });
});

// Like Routes
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const existingLike = likes.find(l => l.postId === postId && l.userId === userId);
  if (existingLike) {
    return res.status(400).json({ error: 'Post already liked' });
  }

  likes.push({
    id: generateId(),
    postId,
    userId,
    createdAt: new Date().toISOString()
  });

  // Update post likes count
  const postIndex = posts.findIndex(p => p.id === postId);
  posts[postIndex].likesCount++;

  res.json({ message: 'Post liked successfully' });
});

app.delete('/api/posts/:postId/like', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  const likeIndex = likes.findIndex(l => l.postId === postId && l.userId === userId);
  if (likeIndex === -1) {
    return res.status(400).json({ error: 'Post not liked' });
  }

  likes.splice(likeIndex, 1);

  // Update post likes count
  const postIndex = posts.findIndex(p => p.id === postId);
  posts[postIndex].likesCount--;

  res.json({ message: 'Post unliked successfully' });
});

// Comment Routes
app.post('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = {
    id: generateId(),
    postId,
    userId: req.user.id,
    content,
    createdAt: new Date().toISOString()
  };

  comments.push(comment);

  // Update post comments count
  const postIndex = posts.findIndex(p => p.id === postId);
  posts[postIndex].commentsCount++;

  // Add user info to response
  const user = users.find(u => u.id === req.user.id);
  res.status(201).json({
    ...comment,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar
    }
  });
});

app.get('/api/posts/:postId/comments', authenticateToken, (req, res) => {
  const postId = req.params.postId;
  const postComments = comments.filter(c => c.postId === postId);

  const commentsWithUserInfo = postComments.map(comment => {
    const user = users.find(u => u.id === comment.userId);
    return {
      ...comment,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      }
    };
  });

  res.json({ comments: commentsWithUserInfo });
});

app.delete('/api/comments/:commentId', authenticateToken, (req, res) => {
  const commentIndex = comments.findIndex(c => c.id === req.params.commentId);
  if (commentIndex === -1) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const comment = comments[commentIndex];
  if (comment.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to delete this comment' });
  }

  // Update post comments count
  const postIndex = posts.findIndex(p => p.id === comment.postId);
  posts[postIndex].commentsCount--;

  comments.splice(commentIndex, 1);

  res.json({ message: 'Comment deleted successfully' });
});

// Search Routes
app.get('/api/search/users', authenticateToken, (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const searchResults = users.filter(user => 
    user.username.toLowerCase().includes(q.toLowerCase()) ||
    user.fullName.toLowerCase().includes(q.toLowerCase())
  ).map(user => ({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    avatar: user.avatar,
    followersCount: user.followersCount
  }));

  res.json({ users: searchResults });
});

// Feed Routes (posts from followed users)
app.get('/api/feed', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Get users that current user follows
  const followedUserIds = follows
    .filter(f => f.followerId === req.user.id)
    .map(f => f.followingId);

  // Include current user's posts in feed
  followedUserIds.push(req.user.id);

  // Get posts from followed users
  const feedPosts = posts.filter(post => followedUserIds.includes(post.userId));

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const postsWithUserInfo = feedPosts.slice(startIndex, endIndex).map(post => {
    const user = users.find(u => u.id === post.userId);
    const isLiked = likes.some(l => l.postId === post.id && l.userId === req.user.id);
    
    return {
      ...post,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      },
      isLiked
    };
  });

  res.json({
    posts: postsWithUserInfo,
    hasMore: endIndex < feedPosts.length,
    totalPosts: feedPosts.length
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }

  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
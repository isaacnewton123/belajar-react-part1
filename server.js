const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors")


const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mini-social-media";

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    avatar: {
      type: String,
      default: null,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Post Schema
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    image: {
      type: String,
      default: null,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Comment Schema
const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Like Schema
const likeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Follow Schema
const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Models
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Like = mongoose.model("Like", likeSchema);
const Follow = mongoose.model("Follow", followSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      fullName,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// User Routes
app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put(
  "/api/users/profile",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const { fullName, bio } = req.body;
      const updateData = {};

      if (fullName) updateData.fullName = fullName;
      if (bio !== undefined) updateData.bio = bio;
      if (req.file) updateData.avatar = req.file.filename;

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatar: user.avatar,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/api/users/:username", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isFollowing = await Follow.findOne({
      followerId: req.user.id,
      followingId: user._id,
    });

    res.json({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      postsCount: user.postsCount,
      createdAt: user.createdAt,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Follow/Unfollow Routes
app.post("/api/users/:userId/follow", authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingFollow = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({ error: "Already following this user" });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    await follow.save();

    // Update counts
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: 1 },
    });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/users/:userId/follow", authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const follow = await Follow.findOneAndDelete({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    if (!follow) {
      return res.status(400).json({ error: "Not following this user" });
    }

    // Update counts
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { followingCount: -1 },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $inc: { followersCount: -1 },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Post Routes
app.post(
  "/api/posts",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const post = new Post({
        userId: req.user.id,
        content,
        image: req.file ? req.file.filename : null,
      });

      await post.save();

      // Update user posts count
      await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });

      // Populate user data for response
      const populatedPost = await Post.findById(post._id).populate(
        "userId",
        "username fullName avatar"
      );

      res.status(201).json({
        id: populatedPost._id,
        userId: populatedPost.userId._id,
        content: populatedPost.content,
        image: populatedPost.image,
        createdAt: populatedPost.createdAt,
        likesCount: populatedPost.likesCount,
        commentsCount: populatedPost.commentsCount,
        user: {
          id: populatedPost.userId._id,
          username: populatedPost.userId.username,
          fullName: populatedPost.userId.fullName,
          avatar: populatedPost.userId.avatar,
        },
        isLiked: false,
      });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("userId", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    // Check which posts are liked by current user
    const postIds = posts.map((post) => post._id);
    const userLikes = await Like.find({
      postId: { $in: postIds },
      userId: req.user.id,
    });

    const likedPostIds = new Set(
      userLikes.map((like) => like.postId.toString())
    );

    const postsWithUserInfo = posts.map((post) => ({
      id: post._id,
      userId: post.userId._id,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      user: {
        id: post.userId._id,
        username: post.userId.username,
        fullName: post.userId.fullName,
        avatar: post.userId.avatar,
      },
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.json({
      posts: postsWithUserInfo,
      hasMore: skip + limit < totalPosts,
      totalPosts,
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate(
      "userId",
      "username fullName avatar"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = await Like.findOne({
      postId: post._id,
      userId: req.user.id,
    });

    res.json({
      id: post._id,
      userId: post.userId._id,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      user: {
        id: post.userId._id,
        username: post.userId.username,
        fullName: post.userId.fullName,
        avatar: post.userId.avatar,
      },
      isLiked: !!isLiked,
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }

    // Delete post and associated data
    await Post.findByIdAndDelete(req.params.postId);
    await Like.deleteMany({ postId: req.params.postId });
    await Comment.deleteMany({ postId: req.params.postId });

    // Update user posts count
    await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: -1 } });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Like Routes
app.post("/api/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const existingLike = await Like.findOne({ postId, userId });
    if (existingLike) {
      return res.status(400).json({ error: "Post already liked" });
    }

    const like = new Like({ postId, userId });
    await like.save();

    // Update post likes count
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    res.json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const like = await Like.findOneAndDelete({ postId, userId });
    if (!like) {
      return res.status(400).json({ error: "Post not liked" });
    }

    // Update post likes count
    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Comment Routes
app.post("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = new Comment({
      postId,
      userId: req.user.id,
      content,
    });

    await comment.save();

    // Update post comments count
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Populate user data for response
    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username fullName avatar"
    );

    res.status(201).json({
      id: populatedComment._id,
      postId: populatedComment.postId,
      userId: populatedComment.userId._id,
      content: populatedComment.content,
      createdAt: populatedComment.createdAt,
      user: {
        id: populatedComment.userId._id,
        username: populatedComment.userId.username,
        fullName: populatedComment.userId.fullName,
        avatar: populatedComment.userId.avatar,
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts/:postId/comments", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ postId })
      .populate("userId", "username fullName avatar")
      .sort({ createdAt: 1 });

    const commentsWithUserInfo = comments.map((comment) => ({
      id: comment._id,
      postId: comment.postId,
      userId: comment.userId._id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.userId._id,
        username: comment.userId.username,
        fullName: comment.userId.fullName,
        avatar: comment.userId.avatar,
      },
    }));

    res.json({ comments: commentsWithUserInfo });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    // Update post comments count
    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentsCount: -1 },
    });

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search Routes
app.get("/api/search/users", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
      ],
    })
      .select("username fullName avatar followersCount")
      .limit(20);

    const searchResults = users.map((user) => ({
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      followersCount: user.followersCount,
    }));

    res.json({ users: searchResults });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Feed Routes (posts from followed users)
app.get("/api/feed", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users that current user follows
    const follows = await Follow.find({ followerId: req.user.id });
    const followedUserIds = follows.map((follow) => follow.followingId);

    // Include current user's posts in feed
    followedUserIds.push(req.user.id);

    const posts = await Post.find({ userId: { $in: followedUserIds } })
      .populate("userId", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({
      userId: { $in: followedUserIds },
    });

    // Check which posts are liked by current user
    const postIds = posts.map((post) => post._id);
    const userLikes = await Like.find({
      postId: { $in: postIds },
      userId: req.user.id,
    });

    const likedPostIds = new Set(
      userLikes.map((like) => like.postId.toString())
    );

    const postsWithUserInfo = posts.map((post) => ({
      id: post._id,
      userId: post.userId._id,
      content: post.content,
      image: post.image,
      createdAt: post.createdAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      user: {
        id: post.userId._id,
        username: post.userId.username,
        fullName: post.userId.fullName,
        avatar: post.userId.avatar,
      },
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    res.json({
      posts: postsWithUserInfo,
      hasMore: skip + limit < totalPosts,
      totalPosts,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }

  console.error("Server error:", error);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`MongoDB connected to: ${MONGODB_URI}`);
});

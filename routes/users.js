// User routes for user management and social features
const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get users without password
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments();
    
    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username firstName lastName')
      .populate('following', 'username firstName lastName');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Get user's posts
    const posts = await Post.find({ author: req.params.id })
      .populate('author', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      user,
      posts
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error while fetching user'
    });
  }
});

// @route   GET /api/users/search/:username
// @desc    Search users by username
// @access  Public
router.get('/search/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Search users by username (case insensitive)
    const users = await User.find({
      username: { $regex: username, $options: 'i' }
    })
    .select('-password')
    .limit(10);
    
    res.json({ users });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Server error while searching users'
    });
  }
});

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    // Check if user is trying to follow themselves
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        message: 'You cannot follow yourself'
      });
    }
    
    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        message: 'You are already following this user'
      });
    }
    
    // Add to following and followers
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      message: 'User followed successfully',
      following: true
    });
    
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      message: 'Server error while following user'
    });
  }
});

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;
    
    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);
    
    if (!targetUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    // Check if currently following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        message: 'You are not following this user'
      });
    }
    
    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== currentUserId.toString()
    );
    
    await Promise.all([currentUser.save(), targetUser.save()]);
    
    res.json({
      message: 'User unfollowed successfully',
      following: false
    });
    
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({
      message: 'Server error while unfollowing user'
    });
  }
});

// @route   GET /api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username firstName lastName bio')
      .select('following');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    res.json({
      following: user.following
    });
    
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      message: 'Server error while fetching following'
    });
  }
});

// @route   GET /api/users/:id/followers
// @desc    Get followers of a user
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username firstName lastName bio')
      .select('followers');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }
    
    res.json({
      followers: user.followers
    });
    
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      message: 'Server error while fetching followers'
    });
  }
});

module.exports = router;


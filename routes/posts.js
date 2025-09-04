// Post routes for CRUD operations
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (with pagination)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get posts with author information
    const posts = await Post.find()
      .populate('author', 'username firstName lastName')
      .populate('comments.user', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalPosts = await Post.countDocuments();
    
    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
    
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName')
      .populate('comments.user', 'username firstName lastName');
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    
    res.json({ post });
    
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Server error while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: 'Post content is required'
      });
    }
    
    // Create new post
    const newPost = new Post({
      content: content.trim(),
      author: req.user._id
    });
    
    // Save post to database
    await newPost.save();
    
    // Populate author information
    await newPost.populate('author', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
    
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      message: 'Server error while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (only post author)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Find the post
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to update this post'
      });
    }
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: 'Post content is required'
      });
    }
    
    // Update post
    post.content = content.trim();
    await post.save();
    
    // Populate author information
    await post.populate('author', 'username firstName lastName');
    
    res.json({
      message: 'Post updated successfully',
      post
    });
    
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      message: 'Server error while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (only post author)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Find the post
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this post'
      });
    }
    
    // Delete post
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({
      message: 'Post deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      message: 'Server error while deleting post'
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    
    const userId = req.user._id;
    const isLiked = post.isLikedBy(userId);
    
    if (isLiked) {
      // Unlike the post
      await post.removeLike(userId);
      res.json({
        message: 'Post unliked successfully',
        liked: false
      });
    } else {
      // Like the post
      await post.addLike(userId);
      res.json({
        message: 'Post liked successfully',
        liked: true
      });
    }
    
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      message: 'Server error while liking post'
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: 'Comment content is required'
      });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }
    
    // Add comment
    await post.addComment(req.user._id, content.trim());
    
    // Populate the updated post with author and comment user info
    await post.populate('author', 'username firstName lastName');
    await post.populate('comments.user', 'username firstName lastName');
    
    res.status(201).json({
      message: 'Comment added successfully',
      post
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      message: 'Server error while adding comment'
    });
  }
});

module.exports = router;


// Post routes for CRUD operations
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/posts
 * Get all posts (paginated)
 * Public
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find()
        .populate('author', 'username firstName lastName')
        .populate('comments.user', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
});

/**
 * GET /api/posts/:id
 * Get a single post by ID
 * Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username firstName lastName')
      .populate('comments.user', 'username firstName lastName');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({ message: 'Server error while fetching the post' });
  }
});

/**
 * POST /api/posts
 * Create a new post (text and/or image)
 * Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    // Must have either text or image
    const hasText = content && content.trim().length > 0;
    const hasImage = typeof imageUrl === 'string' && imageUrl.trim().length > 0;

    if (!hasText && !hasImage) {
      return res.status(400).json({ message: 'Post must have text or an image.' });
    }

    const newPost = new Post({
      author: req.user._id,
      content: hasText ? content.trim() : '',
      imageUrl: hasImage ? imageUrl.trim() : null
    });

    await newPost.save();
    await newPost.populate('author', 'username firstName lastName');

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error while creating post' });
  }
});

/**
 * PUT /api/posts/:id
 * Update a post (text and/or image)
 * Private (author only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Allow updating either/both fields. If `imageUrl` is provided as null or empty string,
    // we treat it as removing the image.
    if (typeof content !== 'undefined') {
      const trimmed = (content || '').trim();
      post.content = trimmed;
    }
    if (typeof imageUrl !== 'undefined') {
      const cleaned = (imageUrl && imageUrl.trim()) || null;
      post.imageUrl = cleaned;
    }

    // Validate: after updates, must still have text or image
    const hasText = post.content && post.content.trim().length > 0;
    const hasImage = !!post.imageUrl;
    if (!hasText && !hasImage) {
      return res.status(400).json({ message: 'Post must have text or an image.' });
    }

    await post.save();
    await post.populate('author', 'username firstName lastName');

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error while updating post' });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post
 * Private (author only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
});

/**
 * POST /api/posts/:id/like
 * Like/unlike a post
 * Private
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const isLiked = post.isLikedBy(userId);

    if (isLiked) {
      await post.removeLike(userId);
      return res.json({ message: 'Post unliked successfully', liked: false });
    } else {
      await post.addLike(userId);
      return res.json({ message: 'Post liked successfully', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error while liking post' });
  }
});

/**
 * POST /api/posts/:id/comment
 * Add a comment
 * Private
 */
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    await post.addComment(req.user._id, content.trim());
    await post.populate('author', 'username firstName lastName');
    await post.populate('comments.user', 'username firstName lastName');

    res.status(201).json({ message: 'Comment added successfully', post });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
});

module.exports = router;

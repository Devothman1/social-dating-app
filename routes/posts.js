import express from 'express';
import { protect } from '../middleware/auth.js';
import Post from '../models/Post.js';

const router = express.Router();

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const { content, image, type, poll, fundraiser } = req.body;

    const post = await Post.create({
      user: req.user._id,
      content,
      image,
      type,
      poll,
      fundraiser
    });

    await post.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all posts (for home feed)
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('likes', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/unlike post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();
    await post.populate('comments.user', 'name avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

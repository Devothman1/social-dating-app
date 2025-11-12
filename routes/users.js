import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all users (for discover page)
router.get('/', protect, async (req, res) => {
  try {
    const { gender, minAge, maxAge, city, interests } = req.query;
    
    let filter = { _id: { $ne: req.user._id } };
    
    if (gender && gender !== 'all') filter.gender = gender;
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }
    if (city) filter.city = new RegExp(city, 'i');
    if (interests) filter.interests = { $in: interests.split(',') };

    const users = await User.find(filter)
      .select('name age gender city job avatar online lastSeen interests')
      .limit(50);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends', 'name avatar job city')
      .populate('matches.user', 'name avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, job, city, bio, interests } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, job, city, bio, interests },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        city: user.city,
        job: user.job,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Send friend request
router.post('/:id/friend-request', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if request already sent
    if (targetUser.friendRequests.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Friend request already sent'
      });
    }

    targetUser.friendRequests.push(req.user._id);
    await targetUser.save();

    res.json({
      success: true,
      message: 'Friend request sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Accept friend request
router.post('/:id/accept-friend', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.friendRequests.includes(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'No friend request from this user'
      });
    }

    // Remove from friend requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== req.params.id
    );

    // Add to friends
    user.friends.push(req.params.id);
    await user.save();

    // Also add current user to the other user's friends
    const otherUser = await User.findById(req.params.id);
    otherUser.friends.push(req.user._id);
    await otherUser.save();

    res.json({
      success: true,
      message: 'Friend request accepted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

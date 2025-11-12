import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [1000, 'Post cannot exceed 1000 characters']
  },
  image: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    enum: ['post', 'poll', 'fundraiser', 'live'],
    default: 'post'
  },
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    endsAt: Date
  },
  fundraiser: {
    title: String,
    description: String,
    goal: Number,
    raised: {
      type: Number,
      default: 0
    },
    donors: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      amount: Number,
      donatedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isLive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);

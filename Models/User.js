hereimport mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Please enter your age'],
    min: [18, 'You must be at least 18 years old']
  },
  gender: {
    type: String,
    required: [true, 'Please select your gender'],
    enum: ['male', 'female', 'other']
  },
  city: {
    type: String,
    required: [true, 'Please enter your city']
  },
  job: {
    type: String,
    required: [true, 'Please enter your job']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=0'
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  online: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Update last seen
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);

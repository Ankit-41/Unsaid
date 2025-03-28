import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'A post must have content'],
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A post must have an author']
  },
  isAnonymous: {
    type: Boolean,
    default: false,
    set: function(value) {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return value;
    }
  },
  spicyLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
    set: function(value) {
      if (typeof value === 'string') {
        return parseInt(value) || 1;
      }
      return value;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disapproved', 'removed'],
    default: 'pending'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual property for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual property for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Set virtuals to true when converting to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post;

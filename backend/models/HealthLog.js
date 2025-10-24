import mongoose from 'mongoose';

const HealthLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  shared: {
    type: Boolean,
    default: false,
    index: true
  },
  // Keeping existing fields for backward compatibility
  content: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add text index for search functionality
HealthLogSchema.index({ description: 'text', 'symptoms': 'text' });

// Compound index for common queries
HealthLogSchema.index({ user: 1, date: -1 });
HealthLogSchema.index({ severity: 1, date: -1 });
HealthLogSchema.index({ shared: 1, date: -1 });

// Virtual for like count
HealthLogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
HealthLogSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if a user has liked the post
HealthLogSchema.methods.hasLiked = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to add a comment
HealthLogSchema.methods.addComment = function(userId, content) {
  this.comments.unshift({
    user: userId,
    content
  });
  return this.save();
};

// Method to remove a comment
HealthLogSchema.methods.removeComment = function(commentId, userId) {
  const commentIndex = this.comments.findIndex(
    comment => comment._id.toString() === commentId && 
    comment.user.toString() === userId.toString()
  );
  
  if (commentIndex !== -1) {
    this.comments.splice(commentIndex, 1);
    return this.save();
  }
  
  return Promise.reject(new Error('Comment not found or unauthorized'));
};

const HealthLog = mongoose.models.HealthLog || mongoose.model('HealthLog', HealthLogSchema);

export default HealthLog;

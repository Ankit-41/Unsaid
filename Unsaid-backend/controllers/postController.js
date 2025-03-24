import Post from '../models/Post.js';



// In postController.js

// Search posts by query (admin only)
export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter is required'
      });
    }
    
    // Search in post content (you can extend the query to other fields as needed)
    const posts = await Post.find({
      content: { $regex: q, $options: 'i' },
      status: 'approved' // or remove this filter if you want to search across all statuses
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('comments.user', 'name');
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};


// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    
    const post = await Post.create({
      content,
      author: req.user._id,
      isAnonymous: isAnonymous || false,
      status: 'pending' // All posts start as pending
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully and pending approval',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .populate('comments.user', 'name');

    const total = await Post.countDocuments({});

    res.status(200).json({
      status: 'success',
      results: posts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { posts }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all approved posts (for normal users)
export const getApprovedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name',
        // Don't expose author details if post is anonymous
        options: { transform: doc => doc && !doc._id ? null : doc }
      })
      .populate('comments.user', 'name');
    
    // Process posts to handle anonymous authors
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (postObj.isAnonymous) {
        postObj.author = { name: 'Anonymous' };
      }
      return postObj;
    });
    
    const total = await Post.countDocuments({ status: 'approved' });
    
    res.status(200).json({
      status: 'success',
      results: processedPosts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts: processedPosts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get posts by status (for admins)
export const getPostsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!['pending', 'approved', 'disapproved', 'removed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status parameter'
      });
    }
    
    const posts = await Post.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .populate('comments.user', 'name');
    
    const total = await Post.countDocuments({ status });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single post by ID
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.user', 'name');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // If user is not an admin and post is not approved, deny access
    if (req.user.role !== 'admin' && post.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this post'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update post status (admin only)
export const updatePostStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'disapproved', 'removed'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }
    
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('author', 'name');
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: `Post status updated to ${status}`,
      data: {
        post
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if post is approved
    if (post.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only like approved posts'
      });
    }
    
    // Check if user already liked the post
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already liked this post'
      });
    }
    
    // Add user to likes array
    post.likes.push(req.user._id);
    await post.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Post liked successfully',
      data: {
        likes: post.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if post is approved
    if (post.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only unlike approved posts'
      });
    }
    
    // Check if user has liked the post
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({
        status: 'error',
        message: 'You have not liked this post yet'
      });
    }
    
    // Remove user from likes array
    post.likes = post.likes.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await post.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Post unliked successfully',
      data: {
        likes: post.likes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Check if post is approved
    if (post.status !== 'approved') {
      return res.status(403).json({
        status: 'error',
        message: 'You can only comment on approved posts'
      });
    }
    
    // Add comment
    const comment = {
      user: req.user._id,
      text
    };
    
    post.comments.push(comment);
    await post.save();
    
    // Populate user info in the new comment
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name');
    
    const newComment = populatedPost.comments[populatedPost.comments.length - 1];
    
    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully',
      data: {
        comment: newComment
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's own posts
export const getMyPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Post.countDocuments({ author: req.user._id });
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

import Post from '../models/Post.js';
import cloudinary from '../config/cloudinary.js';

// Export all controller functions


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
    console.log('Create post request received:');
    console.log('Content Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    
    // Get the content from request body
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Post content is required'
      });
    }
    
    // Determine if request is JSON or FormData
    const isJSONRequest = req.headers['content-type']?.includes('application/json');
    
    // If JSON, use the values directly (they'll be correctly typed)
    // If FormData, parse the values
    let isAnonymous, spicyLevel;
    
    if (isJSONRequest) {
      // For JSON, the values already have proper types
      isAnonymous = req.body.isAnonymous === true;
      spicyLevel = Number(req.body.spicyLevel) || 1;
    } else {
      // For FormData, convert string to appropriate types
      const isAnonymousValue = req.body.isAnonymous;
      const spicyLevelValue = req.body.spicyLevel;
      
      isAnonymous = isAnonymousValue === 'true' || isAnonymousValue === true;
      spicyLevel = parseInt(spicyLevelValue) || 1;
    }
    
    console.log('Parsed values:', { isAnonymous, spicyLevel });
    
    // Initialize post data
    const postData = {
      content: content.trim(),
      author: req.user._id,
      isAnonymous,
      spicyLevel,
      status: 'pending' // All posts start as pending
    };
    
    // Handle image if uploaded
    if (req.files && req.files.image) {
      try {
        const image = req.files.image;
        console.log('Image uploaded:', {
          name: image.name,
          size: image.size,
          tempFilePath: image.tempFilePath
        });
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: 'unsaid_uploads',
          resource_type: 'auto'
        });
        
        console.log('Cloudinary upload result:', result);
        postData.image = result.secure_url;
      } catch (error) {
        console.error('Error processing uploaded image:', error);
        return res.status(400).json({
          status: 'error',
          message: 'Error processing uploaded image',
          error: error.message
        });
      }
    }
    
    console.log('Creating post with data:', postData);
    const post = await Post.create(postData);
    console.log('Post created successfully:', post._id);
    
    res.status(201).json({
      status: 'success',
      message: 'Post created successfully and pending approval',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    
    // Enhanced error handling for validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(field => ({
        path: field,
        message: error.errors[field].message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    
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

    console.log(`Admin fetched ${posts.length} posts`);

    // Process posts to format comments with likes and replies
    const userId = req.user._id.toString();
    
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      
      console.log(`Processing post ${postObj._id} with ${postObj.comments.length} comments for admin view`);
      
      // Process comments to add isLiked status and structure replies
      const allComments = postObj.comments.map(comment => {
        // Ensure likes is always an array
        if (!comment.likes) {
          comment.likes = [];
        }
        
        return {
          ...comment,
          isLiked: comment.likes.some(likeId => likeId.toString() === userId)
        };
      });
      
      // Separate into top-level comments and replies
      const topLevelComments = allComments.filter(comment => !comment.parentId);
      const replies = allComments.filter(comment => comment.parentId);
      
      // Add replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => {
        const commentReplies = replies.filter(
          reply => reply.parentId && reply.parentId.toString() === comment._id.toString()
        );
        return {
          ...comment,
          replies: commentReplies || []
        };
      });
      
      // Update the post object with structured comments
      postObj.comments = commentsWithReplies;
      
      // Ensure spicyLevel exists for backward compatibility
      if (postObj.spicyLevel === undefined) {
        // Calculate spicy level based on content length for existing posts
        const contentLength = postObj.content.length;
        if (contentLength > 400) postObj.spicyLevel = 5;
        else if (contentLength > 300) postObj.spicyLevel = 4;
        else if (contentLength > 200) postObj.spicyLevel = 3;
        else if (contentLength > 100) postObj.spicyLevel = 2;
        else postObj.spicyLevel = 1;
      }
      
      return postObj;
    });

    const total = await Post.countDocuments({});

    res.status(200).json({
      status: 'success',
      results: processedPosts.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { posts: processedPosts }
    });
  } catch (error) {
    console.error('Error fetching all posts for admin:', error);
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
    
    // Fetch posts with populated comments
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
    
    // Log post IDs and their comments to help with debugging
    console.log(`Fetched ${posts.length} approved posts`);
    
    // Process posts to handle anonymous authors, comment likes and replies
    const userId = req.user._id.toString();
    
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      
      // Handle anonymous posts
      if (postObj.isAnonymous) {
        postObj.author = { name: 'Anonymous' };
      }
      
      // Debug log for this post's comment count
      console.log(`Post ${postObj._id}: ${postObj.comments.length} comments`);
      
      // Process comments to add isLiked status and structure replies
      const allComments = postObj.comments.map(comment => {
        // Debug log for comment IDs
        console.log(`Comment ${comment._id} - Parent ID: ${comment.parentId || 'None'}`);
        
        // Ensure likes is always an array
        if (!comment.likes) {
          comment.likes = [];
        }
        
        return {
          ...comment,
          isLiked: comment.likes.some(likeId => likeId.toString() === userId)
        };
      });
      
      // Separate into top-level comments and replies
      const topLevelComments = allComments.filter(comment => !comment.parentId);
      const replies = allComments.filter(comment => comment.parentId);
      
      console.log(`Post ${postObj._id}: ${topLevelComments.length} top-level comments, ${replies.length} replies`);
      
      // Add replies to their parent comments
      const commentsWithReplies = topLevelComments.map(comment => {
        const commentReplies = replies.filter(
          reply => reply.parentId && reply.parentId.toString() === comment._id.toString()
        );
        
        console.log(`Comment ${comment._id}: ${commentReplies.length} replies`);
        
        return {
          ...comment,
          replies: commentReplies || []
        };
      });
      
      // Update the post object with structured comments
      postObj.comments = commentsWithReplies;
      
      // Ensure spicyLevel exists for backward compatibility
      if (postObj.spicyLevel === undefined) {
        // Calculate spicy level based on content length for existing posts
        const contentLength = postObj.content.length;
        if (contentLength > 400) postObj.spicyLevel = 5;
        else if (contentLength > 300) postObj.spicyLevel = 4;
        else if (contentLength > 200) postObj.spicyLevel = 3;
        else if (contentLength > 100) postObj.spicyLevel = 2;
        else postObj.spicyLevel = 1;
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
    console.error('Error fetching approved posts:', error);
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
    
    // Format post to include comment likes and structure comment replies
    const postObj = post.toObject();
    
    // Map through comments to add isLiked status and properly format replies
    const userId = req.user._id.toString();
    
    console.log(`Processing post ${postObj._id} with ${postObj.comments.length} comments`);
    
    // First, prepare all comments with isLiked status
    const allComments = postObj.comments.map(comment => {
      // Debugging info
      console.log(`Processing comment ${comment._id}, parentId: ${comment.parentId || 'None'}, likes: ${comment.likes ? comment.likes.length : 0}`);
      
      // Ensure likes is always an array
      if (!comment.likes) {
        comment.likes = [];
      }
      
      return {
        ...comment,
        isLiked: comment.likes.some(likeId => likeId.toString() === userId)
      };
    });
    
    // Separate into top-level comments and replies
    const topLevelComments = allComments.filter(comment => !comment.parentId);
    const replies = allComments.filter(comment => comment.parentId);
    
    console.log(`Post has ${topLevelComments.length} top-level comments and ${replies.length} replies`);
    
    // Add replies to their parent comments
    const commentsWithReplies = topLevelComments.map(comment => {
      const commentReplies = replies.filter(
        reply => reply.parentId && reply.parentId.toString() === comment._id.toString()
      );
      
      console.log(`Comment ${comment._id} has ${commentReplies.length} replies`);
      
      return {
        ...comment,
        replies: commentReplies || []
      };
    });
    
    // Update the post object with structured comments
    postObj.comments = commentsWithReplies;
    
    res.status(200).json({
      status: 'success',
      data: {
        post: postObj
      }
    });
  } catch (error) {
    console.error('Error getting post:', error);
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

// Add a reply to a comment
export const addCommentReply = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: postId, commentId } = req.params;
    
    const post = await Post.findById(postId);
    
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
    
    // Find the parent comment - more reliable way to find the comment
    const parentComment = post.comments.find(
      comment => comment._id.toString() === commentId
    );
    
    if (!parentComment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Add reply as a new comment with parentId reference
    const reply = {
      user: req.user._id,
      text,
      parentId: parentComment._id // Use the actual ObjectId
    };
    
    post.comments.push(reply);
    await post.save();
    
    // Populate user info in the new reply
    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name');
    
    const newReply = populatedPost.comments[populatedPost.comments.length - 1];
    
    res.status(201).json({
      status: 'success',
      message: 'Reply added successfully',
      data: {
        reply: newReply
      }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Find the comment to like using a more reliable method
    const comment = post.comments.find(
      comment => comment._id.toString() === commentId
    );
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user already liked this comment
    if (comment.likes && comment.likes.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({
        status: 'error',
        message: 'You already liked this comment'
      });
    }
    
    // Initialize likes array if it doesn't exist
    if (!comment.likes) {
      comment.likes = [];
    }
    
    // Add user to likes
    comment.likes.push(userId);
    await post.save();
    
    // Log successful like operation
    console.log(`User ${userId} liked comment ${commentId} on post ${postId}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Comment liked successfully',
      data: {
        likes: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.user._id;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }
    
    // Find the comment to unlike using a more reliable method
    const comment = post.comments.find(
      comment => comment._id.toString() === commentId
    );
    
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }
    
    // Check if user hasn't liked this comment
    if (!comment.likes || !comment.likes.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({
        status: 'error',
        message: 'You have not liked this comment'
      });
    }
    
    // Remove user from likes
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    await post.save();
    
    // Log successful unlike operation
    console.log(`User ${userId} unliked comment ${commentId} on post ${postId}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Comment unliked successfully',
      data: {
        likes: comment.likes.length
      }
    });
  } catch (error) {
    console.error('Error unliking comment:', error);
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
    
    // Process posts to ensure spicyLevel exists for all posts
    const processedPosts = posts.map(post => {
      const postObj = post.toObject();
      // Ensure spicyLevel exists for backward compatibility
      if (postObj.spicyLevel === undefined) {
        // Calculate spicy level based on content length for existing posts
        const contentLength = postObj.content.length;
        if (contentLength > 400) postObj.spicyLevel = 5;
        else if (contentLength > 300) postObj.spicyLevel = 4;
        else if (contentLength > 200) postObj.spicyLevel = 3;
        else if (contentLength > 100) postObj.spicyLevel = 2;
        else postObj.spicyLevel = 1;
      }
      return postObj;
    });
    
    const total = await Post.countDocuments({ author: req.user._id });
    
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

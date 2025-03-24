import express from 'express';
import {
  createPost,
  getApprovedPosts,
  getPostsByStatus,
  getPost,
  updatePostStatus,
  likePost,
  unlikePost,
  addComment,
  getMyPosts,
  searchPosts,
  getAllPosts  // NEW: import getAllPosts
} from '../controllers/postController.js';
import { validate } from '../middleware/validation.js';
import { postSchema, commentSchema, postStatusSchema } from '../middleware/validation.js';
import { protect, restrictTo, isVerified } from '../middleware/auth.js';

const router = express.Router();

// All routes below this middleware are protected
router.use(protect);

// Define admin-only fixed routes BEFORE dynamic routes:
// These routes must be defined first so that they are not captured by a dynamic route (like /:id)
router.get('/all', restrictTo('admin'), getAllPosts);
router.get('/search', restrictTo('admin'), searchPosts);
router.get('/status/:status', restrictTo('admin'), getPostsByStatus);
router.patch('/:id/status', restrictTo('admin'), validate(postStatusSchema), updatePostStatus);

// Now define routes accessible to all authenticated users:
router.get('/approved', getApprovedPosts);
router.get('/my-posts', getMyPosts);

// This dynamic route should come last to avoid conflict with fixed routes like /all
router.get('/:id', getPost);

// Routes that require email verification
router.use(isVerified);
router.post('/', validate(postSchema), createPost);
router.post('/:id/like', likePost);
router.post('/:id/unlike', unlikePost);
router.post('/:id/comments', validate(commentSchema), addComment);

export default router;

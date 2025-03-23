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
  getMyPosts
} from '../controllers/postController.js';
import { validate } from '../middleware/validation.js';
import { postSchema, commentSchema, postStatusSchema } from '../middleware/validation.js';
import { protect, restrictTo, isVerified } from '../middleware/auth.js';

const router = express.Router();

// All routes below this middleware are protected
router.use(protect);

// Routes accessible to all authenticated users
router.get('/approved', getApprovedPosts);
router.get('/my-posts', getMyPosts);
router.get('/:id', getPost);

// Routes that require email verification
router.use(isVerified);
router.post('/', validate(postSchema), createPost);
router.post('/:id/like', likePost);
router.post('/:id/unlike', unlikePost);
router.post('/:id/comments', validate(commentSchema), addComment);

// Admin only routes
router.get('/status/:status', restrictTo('admin'), getPostsByStatus);
router.patch('/:id/status', restrictTo('admin'), validate(postStatusSchema), updatePostStatus);

export default router;

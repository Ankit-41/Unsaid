// adminRoutes.js
import express from 'express';
import {
  getAllUsers,
  getDashboardStats,  // ensure this is imported
  makeAdmin,
  removeAdmin,
  getPostStats
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All routes below are protected and restricted to admins only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getAllUsers);
router.get('/dashboard', getDashboardStats);
router.get('/post-stats', getPostStats);
router.patch('/users/:id/make-admin', makeAdmin);
router.patch('/users/:id/remove-admin', removeAdmin);

export default router;

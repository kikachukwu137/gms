import express from 'express';
import {
  initializePayment,
  verifyPayment,
  getPayment
} from '../controller/paymentController.js';
import { protect} from '../middleware/auth.middleware.js'


const router = express.Router();

// Only authenticated users can access payment endpoints
router.post('/initialize', protect, initializePayment);
router.get('/verify', protect, verifyPayment);
router.get('/', protect, getPayment);

export default router;

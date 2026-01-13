import express from 'express';
import { sendMoney } from '../controllers/transfer.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', protect, sendMoney);

export default router;
import express from 'express';
import { stkPushController, darajaCallback } from '../controllers/daraja.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/stk-push', protect, stkPushController);
router.post('/callback', darajaCallback);

export default router;
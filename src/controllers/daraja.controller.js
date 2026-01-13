// src/controllers/daraja.controller.js
import { stkPush } from '../config/daraja.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

/**
 * Initiate STK Push to top up wallet
 */
export const stkPushController = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    if (amount <= 0) throw new Error('Amount must be positive');

    const accountRef = req.user._id.toString();

    // Call Daraja first
    const stkResponse = await stkPush(phone, amount, accountRef);

    // Save transaction as PENDING with Daraja CheckoutRequestID
    const transaction = await Transaction.create({
      type: 'DEPOSIT',
      toUser: req.user._id,
      amount,
      status: 'PENDING',
      reference: stkResponse.CheckoutRequestID
    });

    res.json({ message: 'STK Push initiated', stkResponse });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * Handle Daraja STK Push callback
 */
export const darajaCallback = async (req, res) => {
  try {
    const body = req.body.Body.stkCallback;
    const resultCode = body.ResultCode;
    const checkoutRequestID = body.CheckoutRequestID;

    // Find transaction by Daraja CheckoutRequestID
    const transaction = await Transaction.findOne({ reference: checkoutRequestID });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (resultCode === 0) {
      // Payment successful
      const amount = body.CallbackMetadata.Item.find(i => i.Name === 'Amount').Value;

      transaction.status = 'SUCCESS';
      await transaction.save();

      // Update user wallet balance
      await User.findByIdAndUpdate(transaction.toUser, { $inc: { balance: amount } });

      res.json({ message: 'Wallet balance updated' });
    } else {
      // Payment failed
      transaction.status = 'FAILED';
      await transaction.save();
      res.json({ message: 'Payment failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Callback error' });
  }
};
import { stkPush } from '../config/daraja.js';
import Transaction from '../models/Transaction.js';

export const stkPushController = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    if (amount <= 0) throw new Error('Amount must be positive');

    const accountRef = req.user._id.toString();

    // Save transaction as PENDING first
    const transaction = await Transaction.create({
      type: 'DEPOSIT',
      toUser: req.user._id,
      amount,
      status: 'PENDING',
      reference: `PesaFlow_${Date.now()}`
    });

    // Call Daraja
    const stkResponse = await stkPush(phone, amount, accountRef);

    res.json({ message: 'STK Push initiated', stkResponse });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// Daraja callback
export const darajaCallback = async (req, res) => {
  try {
    const body = req.body.Body.stkCallback;
    const resultCode = body.ResultCode;

    const checkoutRequestID = body.CheckoutRequestID;
    const transaction = await Transaction.findOne({ reference: checkoutRequestID });

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (resultCode === 0) {
      // Payment successful
      const amount = body.CallbackMetadata.Item.find(i => i.Name === 'Amount').Value;

      transaction.status = 'SUCCESS';
      await transaction.save();

      // Update user balance
      const user = transaction.toUser;
      await (await import('../models/User.js')).default.findByIdAndUpdate(user, { $inc: { balance: amount } });

      res.json({ message: 'Wallet balance updated' });
    } else {
      transaction.status = 'FAILED';
      await transaction.save();
      res.json({ message: 'Payment failed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Callback error' });
  }
};
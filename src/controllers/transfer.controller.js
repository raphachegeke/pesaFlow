import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

export const sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { toEmail, amount } = req.body;
    if (amount <= 0) throw new Error('Amount must be positive');

    const sender = await User.findById(req.user._id).session(session);
    const receiver = await User.findOne({ email: toEmail }).session(session);

    if (!receiver) throw new Error('Receiver not found');
    if (sender.balance < amount) throw new Error('Insufficient balance');

    // Update balances
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save({ session });
    await receiver.save({ session });

    // Save transaction
    const transaction = new Transaction({
      type: 'TRANSFER',
      fromUser: sender._id,
      toUser: receiver._id,
      amount,
      status: 'SUCCESS'
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Transfer successful' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
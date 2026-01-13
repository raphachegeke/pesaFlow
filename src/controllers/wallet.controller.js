import Transaction from '../models/Transaction.js';

export const getBalance = async (req, res) => {
  try {
    res.json({ balance: req.user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ fromUser: req.user._id }, { toUser: req.user._id }]
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
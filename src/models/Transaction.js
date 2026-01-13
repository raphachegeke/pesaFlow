import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['DEPOSIT','TRANSFER'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','SUCCESS','FAILED'], default: 'PENDING' },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
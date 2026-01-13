import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './src/routes/auth.routes.js';
import walletRoutes from './src/routes/wallet.routes.js';
import transferRoutes from './src/routes/transfer.routes.js';
import darajaRoutes from './src/routes/daraja.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/daraja', darajaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'PesaFlow API running' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server running')
    );
  })
  .catch(err => console.error(err));
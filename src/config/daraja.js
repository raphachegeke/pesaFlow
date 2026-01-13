import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = 'https://api.safaricom.co.ke';
const consumerKey = process.env.DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
const shortCode = process.env.DARAJA_SHORT_CODE;
const passkey = process.env.DARAJA_PASSKEY;
const callbackURL = process.env.DARAJA_CALLBACK_URL;

// Get OAuth token
export const getDarajaToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const res = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });

  return res.data.access_token;
};

// STK Push request
export const stkPush = async (phone, amount, accountRef) => {
  const token = await getDarajaToken();
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const data = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerBuyGoodsOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: 6444134,
    PhoneNumber: phone,
    CallBackURL: callbackURL,
    AccountReference: accountRef,
    TransactionDesc: 'PesaFlow Wallet Topup'
  };

  const res = await axios.post(`${baseURL}/mpesa/stkpush/v1/processrequest`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.data;
};
// api/razorpay/create-order.js
import Razorpay from 'razorpay';
import { savePendingClient } from '../../database/db.cjs';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { name, email, mobile } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { description: 'Admin Registration Advance Deposit' },
    });
    await savePendingClient(name, email, mobile, order.id);
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message });
  }
}

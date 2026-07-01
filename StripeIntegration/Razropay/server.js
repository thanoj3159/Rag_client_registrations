// server.js
// One-time payment integration using Razorpay

require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const { savePendingClient, confirmClientPayment } = require('../../database/db.cjs');

const app = express();

// Allow requests from the React frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));
app.use(express.json());

// Initialize Razorpay with your Key ID and Key Secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ----------------------------------------------------------------
// POST /create-order
// Creates a Razorpay order for ₹1 (amount in paise: 100 = ₹1)
// ----------------------------------------------------------------
app.post('/create-order', async (req, res) => {
  const { name, email, mobile } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({ error: 'Missing name, email, or mobile number in request body' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: 100,           // Amount in paise (100 paise = ₹1)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        description: 'Admin Registration Advance Deposit',
      },
    });

    // Save pending client details to PostgreSQL database
    await savePendingClient(name, email, mobile, order.id);

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID, // Safe to send to frontend
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------
// POST /verify-payment
// Verifies the payment signature after Razorpay checkout completes
// ----------------------------------------------------------------
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    console.log(`✅ Payment verified! Payment ID: ${razorpay_payment_id}`);
    try {
      // Update payment_status to TRUE and save the payment ID
      await confirmClientPayment(razorpay_order_id, razorpay_payment_id);
      res.json({ verified: true, payment_id: razorpay_payment_id });
    } catch (dbErr) {
      console.error('Database update failed after payment verification:', dbErr);
      res.status(500).json({ verified: true, payment_id: razorpay_payment_id, error: 'Database update failed' });
    }
  } else {
    console.error('❌ Payment verification failed — signature mismatch');
    res.status(400).json({ verified: false, error: 'Invalid payment signature' });
  }
});

app.listen(4242, () => {
  console.log('✅ Razorpay server running on http://localhost:4242');
  console.log('   Endpoints:');
  console.log('   POST http://localhost:4242/create-order');
  console.log('   POST http://localhost:4242/verify-payment');
});

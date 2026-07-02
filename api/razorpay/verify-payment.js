// api/razorpay/verify-payment.js
import crypto from 'crypto';
import { confirmClientPayment } from '../../database/db.cjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
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
}

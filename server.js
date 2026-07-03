import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import pg from 'pg';
import Razorpay from 'razorpay';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - allow frontend origins
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================================
// Database Setup (PostgreSQL)
// ================================================================
const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'clients',
      password: process.env.DB_PASSWORD || '2806',
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: false,
    });

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

const savePendingClient = async (name, email, mobile, orderId) => {
  const query = `
    INSERT INTO clients (name, admin_email, admin_mobile_number, payment_status, razorpay_order_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (razorpay_order_id) DO UPDATE 
    SET name = EXCLUDED.name, 
        admin_email = EXCLUDED.admin_email, 
        admin_mobile_number = EXCLUDED.admin_mobile_number
    RETURNING *;
  `;
  const values = [name, email, mobile, false, orderId];
  try {
    const res = await pool.query(query, values);
    console.log(`💾 Pending client saved: ${name} (Order: ${orderId})`);
    return res.rows[0];
  } catch (err) {
    console.error('Error saving pending client to database:', err);
    throw err;
  }
};

const confirmClientPayment = async (orderId, paymentId) => {
  const query = `
    UPDATE clients 
    SET payment_status = TRUE, 
        razorpay_payment_id = $1 
    WHERE razorpay_order_id = $2 
    RETURNING *;
  `;
  const values = [paymentId, orderId];
  try {
    const res = await pool.query(query, values);
    if (res.rowCount === 0) {
      console.warn(`⚠️ No client record found matching order_id: ${orderId}`);
    } else {
      console.log(`✅ Payment verified in DB for client ID: ${res.rows[0].id}`);
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error confirming client payment in database:', err);
    throw err;
  }
};

// ================================================================
// Twilio OTP Endpoints
// ================================================================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || process.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || process.env.VITE_TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || process.env.VITE_TWILIO_VERIFY_SERVICE_SID;

const TWILIO_API_BASE = `https://verify.twilio.com/v2/Services/${VERIFY_SERVICE_SID}`;
const AUTH_HEADER = `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`;

app.post('/api/twilio/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Phone number required' });
    }

    const response = await fetch(`${TWILIO_API_BASE}/Verifications`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Channel: 'sms',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message || 'Failed to send OTP' });
    }
    
    res.json({ success: true, sid: data.sid, status: data.status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/twilio/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ success: false, error: 'Phone number and code required' });
    }

    const response = await fetch(`${TWILIO_API_BASE}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Code: code,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message || 'Verification failed' });
    }
    
    res.json({ success: data.status === 'approved', status: data.status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// Razorpay Payment Endpoints
// ================================================================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    console.log(`✅ Payment verified! Payment ID: ${razorpay_payment_id}`);
    try {
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

// ================================================================
// Health Check
// ================================================================
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================================================================
// Start Server
// ================================================================
app.listen(PORT, () => {
  console.log(`✅ Combined server running on port ${PORT}`);
  console.log('   Endpoints:');
  console.log(`   POST /api/twilio/send-otp`);
  console.log(`   POST /api/twilio/verify-otp`);
  console.log(`   POST /create-order`);
  console.log(`   POST /verify-payment`);
  console.log(`   GET  /health`);
});

export default app;
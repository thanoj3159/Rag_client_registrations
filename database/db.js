const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'clients',
  password: process.env.DB_PASSWORD || '2806',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

/**
 * Saves client's initial details before completing the payment
 * @param {string} name
 * @param {string} email
 * @param {string} mobile
 * @param {string} orderId
 * @returns {Promise<object>}
 */
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

/**
 * Confirms payment and updates payment_status to true (boolean)
 * @param {string} orderId
 * @param {string} paymentId
 * @returns {Promise<object>}
 */
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
      console.log(`✅ Client payment verified in database for client ID: ${res.rows[0].id}`);
    }
    return res.rows[0];
  } catch (err) {
    console.error('Error confirming client payment in database:', err);
    throw err;
  }
};

module.exports = {
  pool,
  savePendingClient,
  confirmClientPayment,
};

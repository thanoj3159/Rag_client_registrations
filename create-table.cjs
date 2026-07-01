const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clients', password: '2806', port: 5432 });

pool.query('DROP TABLE IF EXISTS clients CASCADE')
  .then(() => {
    const createTable = `
    CREATE TABLE clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        admin_email VARCHAR(255) NOT NULL,
        admin_mobile_number VARCHAR(20) NOT NULL,
        payment_status BOOLEAN DEFAULT FALSE,
        razorpay_order_id VARCHAR(255) UNIQUE,
        razorpay_payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX idx_clients_razorpay_order_id ON clients(razorpay_order_id);
    CREATE INDEX idx_clients_admin_email ON clients(admin_email);
    `;
    return pool.query(createTable);
  })
  .then(() => console.log('Table created successfully'))
  .catch(e => console.error('Error:', e.message))
  .finally(() => pool.end());
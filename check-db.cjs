const { Pool } = require('pg');
const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'clients', password: '2806', port: 5432 });
pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'clients'")
  .then(r => console.log('Columns:', r.rows.map(r => r.column_name)))
  .catch(e => console.error('Error:', e.message))
  .finally(() => pool.end());
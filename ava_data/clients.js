const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from the root .env file if it exists
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// To connect to Neon, you will need your Neon connection string.
// You can either add DATABASE_URL to your .env file, or paste your connection string directly below.
const connectionString = process.env.DATABASE_URL || "postgresql://[username]:[password]@[neon_hostname]/[dbname]?sslmode=require";

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Neon requires SSL
  }
});

async function exportClientsData() {
  try {
    console.log('Connecting to Neon database...');
    // Query to fetch all data from the clients table
    const result = await pool.query('SELECT * FROM clients');
    
    const data = result.rows;
    console.log(`Fetched ${data.length} records from the clients table.`);

    // Define the output file path in the ava_data folder
    const outputPath = path.join(__dirname, 'clients_data.json');
    
    // Write the data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Data successfully saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error fetching data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

exportClientsData();

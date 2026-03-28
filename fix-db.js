const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'medical_app',
});

async function run() {
  try {
    await client.connect();
    
    // Add columns if they don't exist
    await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='two_factor_secret') THEN
              ALTER TABLE profiles ADD COLUMN two_factor_secret varchar;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_two_factor_enabled') THEN
              ALTER TABLE profiles ADD COLUMN is_two_factor_enabled boolean DEFAULT false;
          END IF;
      END
      $$;
    `);
    
    console.log('Columns added successfully');
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await client.end();
  }
}

run();

import { query } from '../config/database';

const addUserProfileFields = async () => {
  console.log('🔧 Adding nickname, birth_date and country columns to users table...');

  try {
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
      ADD COLUMN IF NOT EXISTS birth_date DATE,
      ADD COLUMN IF NOT EXISTS country VARCHAR(100)
    `);
    console.log('✅ Columns nickname, birth_date and country added to users table');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
};

addUserProfileFields()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

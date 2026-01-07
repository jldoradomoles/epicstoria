import { query } from '../config/database';

const createTables = async () => {
  console.log('🔧 Starting database migration...');

  try {
    // Create user role enum type
    await query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ User role enum created');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        lastname VARCHAR(255),
        role user_role DEFAULT 'user' NOT NULL,
        avatar_url VARCHAR(500),
        bio TEXT,
        favorite_category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Add role column if it doesn't exist (for existing databases)
    await query(`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `);
    console.log('✅ Role column ensured');

    // Create events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        summary JSONB NOT NULL,
        context JSONB NOT NULL,
        key_facts JSONB NOT NULL,
        timeline JSONB NOT NULL,
        consequences JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Events table created');

    // Create user_favorite_events table (for future use)
    await query(`
      CREATE TABLE IF NOT EXISTS user_favorite_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      )
    `);
    console.log('✅ User favorite events table created');

    // Create user_event_progress table (for quiz progress, future use)
    await query(`
      CREATE TABLE IF NOT EXISTS user_event_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_id VARCHAR(255) REFERENCES events(id) ON DELETE CASCADE,
        quiz_score INTEGER,
        quiz_completed_at TIMESTAMP,
        times_viewed INTEGER DEFAULT 0,
        last_viewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      )
    `);
    console.log('✅ User event progress table created');

    // Create function to update updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers for updated_at
    await query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    await query(`
      DROP TRIGGER IF EXISTS update_events_updated_at ON events;
      CREATE TRIGGER update_events_updated_at
        BEFORE UPDATE ON events
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Triggers created');
    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }

  process.exit(0);
};

createTables();

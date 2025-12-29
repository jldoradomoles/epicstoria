import * as fs from 'fs';
import * as path from 'path';
import { query } from '../config/database';

interface EventData {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  summary: string | string[];
  context: string | string[];
  keyFacts: Array<{ title: string; description: string }>;
  timeline: Array<{ date: string; event: string }>;
  consequences: string | string[];
}

const seedEvents = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Read events from JSON file
    const eventsPath = path.join(__dirname, '../../../public/data/events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8')) as EventData[];

    console.log(`📚 Found ${eventsData.length} events to seed`);

    // Clear existing events (optional - comment out if you want to keep existing data)
    await query('DELETE FROM user_event_progress');
    await query('DELETE FROM user_favorite_events');
    await query('DELETE FROM events');
    console.log('🗑️ Cleared existing events');

    // Insert events
    for (const event of eventsData) {
      await query(
        `INSERT INTO events (id, title, date, category, image_url, summary, context, key_facts, timeline, consequences)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           date = EXCLUDED.date,
           category = EXCLUDED.category,
           image_url = EXCLUDED.image_url,
           summary = EXCLUDED.summary,
           context = EXCLUDED.context,
           key_facts = EXCLUDED.key_facts,
           timeline = EXCLUDED.timeline,
           consequences = EXCLUDED.consequences`,
        [
          event.id,
          event.title,
          event.date,
          event.category,
          event.imageUrl,
          JSON.stringify(event.summary),
          JSON.stringify(event.context),
          JSON.stringify(event.keyFacts),
          JSON.stringify(event.timeline),
          JSON.stringify(event.consequences),
        ],
      );
      console.log(`  ✅ Inserted: ${event.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }

  process.exit(0);
};

seedEvents();

import bcrypt from 'bcryptjs';
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

const seedAdminUsers = async () => {
  console.log('👤 Creating admin users...');

  const adminUsers = [
    {
      email: 'admin@epicstoria.com',
      password: 'Admin@Secure#2026!$gHI',
      name: 'Admin',
      lastname: 'Principal',
      role: 'admin',
    },
    {
      email: 'superadmin@epicstoria.com',
      password: 'SuperAdmin@Secure#2026!$gHI',
      name: 'Super',
      lastname: 'Administrador',
      role: 'admin',
    },
  ];

  for (const admin of adminUsers) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    await query(
      `INSERT INTO users (email, password, name, lastname, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET
         password = EXCLUDED.password,
         name = EXCLUDED.name,
         lastname = EXCLUDED.lastname,
         role = EXCLUDED.role`,
      [admin.email, hashedPassword, admin.name, admin.lastname, admin.role],
    );
    console.log(`  ✅ Admin created: ${admin.email}`);
  }
};

const seedEvents = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Read events from JSON file
    const eventsPath = path.join(__dirname, '../../../public/data/events.json');
    const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8')) as EventData[];

    console.log(`📚 Found ${eventsData.length} events to seed`);

    // Limpieza completa de datos relacionados
    console.log('🧹 Limpiando datos existentes...');
    await query('DELETE FROM user_event_progress');
    console.log('  ✅ Progreso de usuarios eliminado');

    await query('DELETE FROM user_favorite_events');
    console.log('  ✅ Favoritos de usuarios eliminado');

    await query('DELETE FROM events');
    console.log('  ✅ Eventos eliminados');

    // Verificar IDs únicos en el archivo JSON
    const uniqueIds = new Set(eventsData.map((e) => e.id));
    if (uniqueIds.size !== eventsData.length) {
      console.warn('⚠️ Advertencia: Se detectaron IDs duplicados en events.json');
      const duplicates = eventsData
        .map((e) => e.id)
        .filter((id, index, arr) => arr.indexOf(id) !== index);
      console.warn(`   IDs duplicados: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Insertar eventos sin ON CONFLICT para evitar duplicaciones
    let insertedCount = 0;
    for (const event of eventsData) {
      try {
        await query(
          `INSERT INTO events (id, title, date, category, image_url, summary, context, key_facts, timeline, consequences)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
        insertedCount++;
        console.log(`  ✅ [${insertedCount}/${eventsData.length}] ${event.title}`);
      } catch (error: any) {
        console.error(
          `  ❌ Error insertando evento "${event.title}" (ID: ${event.id}):`,
          error.message,
        );
      }
    }

    console.log('');
    console.log('📊 Resumen de inserción:');
    console.log(`   Total de eventos en archivo: ${eventsData.length}`);
    console.log(`   Eventos insertados correctamente: ${insertedCount}`);
    console.log(`   Eventos con error: ${eventsData.length - insertedCount}`);
    console.log('');
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }

  process.exit(0);
};

const runSeed = async () => {
  await seedAdminUsers();
  // await seedEvents(); // Comentado: usar backup de BD local para eventos reales
  console.log('\n✅ Seed completado: Solo usuarios admin creados');
  console.log('💡 Para eventos: restaura backup de BD local con psql');
  process.exit(0);
};

runSeed();

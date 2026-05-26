import { query } from '../config/database';

const addLevelColumn = async () => {
  console.log('🔧 Adding level column to users table...');

  try {
    await query(
      `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS level VARCHAR(100) DEFAULT 'Aprendiz del Tiempo'
    `,
      [],
    );
    console.log('✅ Column level added to users table');

    // Update all existing users' levels based on their current points
    console.log('🔄 Updating existing users levels based on their points...');
    await query(
      `
      UPDATE users SET level = CASE
        WHEN points >= 5000 THEN 'Arquitecto del Tiempo: Leyenda'
        WHEN points >= 4500 THEN 'Arquitecto del Tiempo: Titán'
        WHEN points >= 4000 THEN 'Leyenda Temporal I'
        WHEN points >= 3600 THEN 'Leyenda Temporal II'
        WHEN points >= 3200 THEN 'Leyenda Temporal III'
        WHEN points >= 2800 THEN 'Señor Diamante I'
        WHEN points >= 2500 THEN 'Señor Diamante II'
        WHEN points >= 2200 THEN 'Señor Diamante III'
        WHEN points >= 1900 THEN 'Conquistador Esmeralda'
        WHEN points >= 1600 THEN 'Sabio Rubí I'
        WHEN points >= 1300 THEN 'Sabio Rubí II'
        WHEN points >= 1100 THEN 'Sabio Rubí III'
        WHEN points >= 900  THEN 'Maestro Zafiro'
        WHEN points >= 700  THEN 'Guardián de Oro I'
        WHEN points >= 500  THEN 'Guardián de Oro II'
        WHEN points >= 300  THEN 'Guardián de Oro III'
        WHEN points >= 200  THEN 'Explorador de Plata'
        WHEN points >= 100  THEN 'Cronista de Bronce'
        ELSE 'Aprendiz del Tiempo'
      END
    `,
      [],
    );
    console.log('✅ Existing users levels updated');
  } catch (error) {
    console.error('❌ Error adding level column:', error);
    throw error;
  }
};

addLevelColumn()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

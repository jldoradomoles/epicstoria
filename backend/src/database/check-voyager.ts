/**
 * Script para verificar los datos del evento Voyager 1
 * y comprobar si tiene preguntas de examen
 */

import pool from '../config/database';

async function checkVoyagerExam() {
  const client = await pool.connect();

  try {
    console.log('🔍 Verificando datos del evento Voyager 1...\n');

    // Buscar el evento Voyager 1
    const result = await client.query(`
      SELECT id, title, slug, exam
      FROM events
      WHERE title ILIKE '%voyager%'
      ORDER BY date DESC
      LIMIT 5;
    `);

    if (result.rows.length === 0) {
      console.log('❌ No se encontró ningún evento con "Voyager" en el título');
      return;
    }

    console.log(`✅ Encontrados ${result.rows.length} evento(s):\n`);

    result.rows.forEach((event, index) => {
      console.log(`--- Evento ${index + 1} ---`);
      console.log(`ID: ${event.id}`);
      console.log(`Título: ${event.title}`);
      console.log(`Slug: ${event.slug}`);

      if (event.exam) {
        const examQuestions = JSON.parse(JSON.stringify(event.exam));
        console.log(`✅ Tiene preguntas de examen: ${examQuestions.length} pregunta(s)`);

        // Mostrar las primeras 2 preguntas como ejemplo
        console.log('\n📝 Primeras preguntas:');
        examQuestions.slice(0, 2).forEach((q: any, i: number) => {
          console.log(`\n  Pregunta ${i + 1}: ${q.question}`);
          console.log(`  Opciones: ${q.options.join(', ')}`);
          console.log(`  Respuesta correcta: Índice ${q.correctAnswer}`);
          if (q.explanation) {
            console.log(`  Explicación: ${q.explanation}`);
          }
        });
      } else {
        console.log('❌ NO tiene preguntas de examen (campo exam es null)');
      }
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Error al verificar el evento:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar la verificación
checkVoyagerExam()
  .then(() => {
    console.log('🎉 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

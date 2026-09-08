import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

interface ExcelRow {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  summary: string;
  context: string;
  keyFacts: string;
  timeline: string;
  consequences: string;
  exam?: string; // Columna K: preguntas del examen
}

/**
 * Normaliza la ruta de la imagen para que sea relativa (sin barra inicial)
 * y convierte la extensión a .webp
 */
function normalizeImageUrl(imageUrl: string): string {
  if (!imageUrl) return imageUrl;

  // Si la ruta empieza con "/", eliminarla para hacerla relativa
  let normalized = imageUrl;
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }

  // Convertir extensión a .webp (para rutas locales, no URLs externas)
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = normalized.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }

  return normalized;
}

/**
 * Convierte una fecha de formato dd-mm-yyyy a yyyy-mm-dd
 * También maneja fechas seriales de Excel (números)
 */
function convertDate(dateStr: string | number): string {
  // Si es un número (fecha serial de Excel), convertirla
  if (typeof dateStr === 'number') {
    const date = XLSX.SSF.parse_date_code(dateStr);
    const year = date.y;
    const month = String(date.m).padStart(2, '0');
    const day = String(date.d).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convertir a string si no lo es
  const dateString = String(dateStr);

  // Si la fecha ya está en formato yyyy-mm-dd, devolverla tal cual
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Si está en formato dd-mm-yyyy o dd/mm/yyyy, convertirla
  const dateParts = dateString.split(/[-/]/);
  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si no coincide con ningún formato, devolver tal cual
  return dateString;
}

/**
 * Convierte un archivo Excel a JSON para eventos
 *
 * Formato esperado del Excel:
 * - Columna A: id
 * - Columna B: title
 * - Columna C: date (formato DD-MM-YYYY o YYYY-MM-DD)
 * - Columna D: category
 * - Columna E: imageUrl
 * - Columna F: summary (cada párrafo separado por ||)
 * - Columna G: context (cada párrafo separado por ||)
 * - Columna H: keyFacts (formato: Título 1|Descripción 1||Título 2|Descripción 2)
 * - Columna I: timeline (formato: DD-MM-YYYY|Evento 1||DD-MM-YYYY|Evento 2)
 * - Columna J: consequences (cada párrafo separado por ||)
 * - Columna K: exam (formato: Pregunta1|Opción1|Opción2|Opción3|Opción4|ÍndiceCorrect|Explicación||Pregunta2|...)
 */
function excelToJson(excelFilePath: string, outputJsonPath: string) {
  try {
    // Leer el archivo Excel
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    // Transformar los datos al formato esperado
    const events = data.map((row) => {
      // Procesar keyFacts
      const keyFacts = row.keyFacts
        ? row.keyFacts.split('||').map((fact) => {
            const [title, description] = fact.split('|').map((s) => s.trim());
            return { title, description };
          })
        : [];

      // Procesar timeline
      const timeline = row.timeline
        ? row.timeline.split('||').map((item) => {
            const [date, event] = item.split('|').map((s) => s.trim());
            return { date: convertDate(date), event };
          })
        : [];

      // Procesar summary (array de párrafos)
      const summary = row.summary ? row.summary.split('||').map((p) => p.trim()) : [];

      // Procesar context (array de párrafos)
      const context = row.context ? row.context.split('||').map((p) => p.trim()) : [];

      // Procesar consequences (array de párrafos)
      const consequences = row.consequences
        ? row.consequences.split('||').map((p) => p.trim())
        : [];

      // Procesar exam (array de preguntas)
      const exam = row.exam
        ? row.exam
            .split('||')
            .map((questionStr) => {
              const parts = questionStr.split('|').map((s) => s.trim());
              if (parts.length >= 6) {
                return {
                  question: parts[0],
                  options: [parts[1], parts[2], parts[3], parts[4]],
                  correctAnswer: parseInt(parts[5], 10),
                  explanation: parts[6] || undefined,
                };
              }
              return null;
            })
            .filter((q) => q !== null)
        : undefined;

      return {
        id: row.id,
        title: row.title,
        date: convertDate(row.date),
        category: row.category,
        imageUrl: normalizeImageUrl(row.imageUrl),
        summary,
        context,
        keyFacts,
        timeline,
        consequences,
        exam,
      };
    });

    // Guardar como JSON
    fs.writeFileSync(outputJsonPath, JSON.stringify(events, null, 2), 'utf-8');

    console.log(`✅ Archivo convertido exitosamente: ${outputJsonPath}`);
    console.log(`📊 Total de eventos: ${events.length}`);
  } catch (error) {
    console.error('❌ Error al convertir el archivo:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
📖 Uso: node excel-to-json.js <archivo-excel> [archivo-salida]

Ejemplo:
  node excel-to-json.js eventos.xlsx
  node excel-to-json.js eventos.xlsx public/data/events.json

Formato del Excel:
  - Columna A: id (ej: apolo-11)
  - Columna B: title (ej: Alunizaje del Apolo 11)
  - Columna C: date (ej: 1969-07-20)
  - Columna D: category (ej: Ciencia)
  - Columna E: imageUrl (ej: /images/apolo-11.jpg)
  - Columna F: summary (texto breve)
  - Columna G: context (párrafos separados por ||)
  - Columna H: keyFacts (formato: Título1|Desc1||Título2|Desc2)
  - Columna I: timeline (formato: Fecha1|Evento1||Fecha2|Evento2)
  - Columna J: consequences (párrafos separados por ||)
  - Columna K: exam (formato: Pregunta1|Opción1|Opción2|Opción3|Opción4|ÍndiceCorrect|Explicación||Pregunta2|...)
    `);
    process.exit(1);
  }

  const excelFile = args[0];
  const outputFile = args[1] || path.join('public', 'data', 'events.json');

  excelToJson(excelFile, outputFile);
}

export { excelToJson };

import * as path from 'path';
import * as XLSX from 'xlsx';

/**
 * Crea un archivo Excel de plantilla para eventos
 */
function createTemplate() {
  // Datos de ejemplo
  const data = [
    {
      id: 'apolo-11',
      title: 'Alunizaje del Apolo 11',
      date: '20-07-1969',
      category: 'Ciencia',
      imageUrl: '/images/eventos/apolo-11.jpg',
      summary:
        'Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en caminar sobre la superficie lunar.||Este hito histórico marcó el triunfo del programa espacial estadounidense y demostró la capacidad humana para explorar otros mundos.',
      context:
        'Durante la Guerra Fría, Estados Unidos y la Unión Soviética competían por la supremacía espacial.||El programa Apolo fue la respuesta estadounidense al desafío del presidente Kennedy de llevar un hombre a la Luna antes del fin de la década de 1960.',
      keyFacts:
        'Primera pisada lunar|Neil Armstrong pronuncia las famosas palabras: Un pequeño paso para el hombre||Duración de la misión|Los astronautas pasaron aproximadamente 21 horas en la superficie lunar||Muestras lunares|Se recogieron 21.5 kg de rocas y muestras del suelo lunar',
      timeline:
        '16-07-1969|Lanzamiento del Apolo 11 desde Cabo Cañaveral||20-07-1969|Alunizaje en el Mar de la Tranquilidad||24-07-1969|Amerizaje exitoso en el Océano Pacífico',
      consequences:
        'El alunizaje demostró la capacidad tecnológica de la humanidad y cambió para siempre nuestra percepción del espacio.||Inspiró generaciones de científicos e ingenieros y estableció las bases para la exploración espacial moderna.',
    },
    {
      id: 'caida-muro-berlin',
      title: 'Caída del Muro de Berlín',
      date: '09-11-1989',
      category: 'Política',
      imageUrl: '/images/eventos/muro-berlin.jpg',
      summary:
        'El Muro de Berlín es derribado por ciudadanos alemanes en un acto histórico de reunificación.||Miles de personas celebraron la apertura de las fronteras que habían dividido la ciudad durante casi tres décadas.',
      context:
        'El Muro fue construido en 1961 para evitar la emigración masiva de alemanes orientales hacia el oeste.||Durante 28 años dividió Berlín y se convirtió en el símbolo más visible de la Guerra Fría.',
      keyFacts:
        '28 años de división|El Muro separó Berlín Oriental y Occidental desde 1961 hasta 1989||Reunificación alemana|La caída del Muro llevó a la reunificación oficial de Alemania el 3 de octubre de 1990||Fin de la Guerra Fría|Marcó el principio del fin del conflicto entre el bloque occidental y el oriental',
      timeline:
        '13-08-1961|Construcción del Muro de Berlín||09-11-1989|Apertura de los puntos de control fronterizos||03-10-1990|Reunificación oficial de Alemania',
      consequences:
        'La caída del Muro simbolizó el colapso del comunismo en Europa Oriental y el fin de la Guerra Fría.||Transformó el mapa político europeo y global, llevando a la expansión de la OTAN y la Unión Europea.',
    },
  ];

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos');

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 20 }, // id
    { wch: 35 }, // title
    { wch: 12 }, // date
    { wch: 15 }, // category
    { wch: 25 }, // imageUrl
    { wch: 60 }, // summary
    { wch: 80 }, // context
    { wch: 80 }, // keyFacts
    { wch: 80 }, // timeline
    { wch: 80 }, // consequences
  ];
  worksheet['!cols'] = colWidths;

  // Guardar archivo
  const outputPath = path.join('eventos-plantilla.xlsx');
  XLSX.writeFile(workbook, outputPath);

  console.log(`✅ Plantilla creada: ${outputPath}`);
  console.log(
    `📝 Edita este archivo y luego ejecuta: npm run excel:convert eventos-plantilla.xlsx`,
  );
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createTemplate();
}

export { createTemplate };

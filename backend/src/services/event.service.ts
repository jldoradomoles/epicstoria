import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Event, EventResponse } from '../models/event.model';
import { generateEventSlug } from '../utils/slug.utils';

interface ExcelRow {
  id: string;
  title: string;
  date: string | number;
  category: string;
  imageUrl: string;
  summary: string;
  context: string;
  keyFacts: string;
  timeline: string;
  consequences: string;
  exam?: string; // Columna K: preguntas del examen
}

interface UploadResult {
  created: number;
  updated: number;
  errors: string[];
}

export class EventService {
  private static readonly DEFAULT_IMAGE =
    'https://placehold.co/600x400/1F2937/FFFFFF?text=Evento+Hist%C3%B3rico';

  /**
   * Verifica si una imagen existe en el sistema de archivos
   * Si no existe, retorna la imagen por defecto
   */
  private static validateImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl || this.DEFAULT_IMAGE;
    }

    // Construir la ruta completa del archivo
    const imagePath = imageUrl.replace(/^\//, '');
    const fullPath = path.join(__dirname, '../../../public', imagePath);

    // Verificar si el archivo existe
    if (fs.existsSync(fullPath)) {
      return imageUrl;
    }

    // Si no existe, retornar la imagen por defecto
    return this.DEFAULT_IMAGE;
  }

  /**
   * Detecta automáticamente imágenes adicionales con el patrón nombre-2, nombre-3, etc.
   * @param imageUrl URL de la imagen principal
   * @returns Array de URLs de imágenes adicionales encontradas
   */
  private static detectAdditionalImages(imageUrl: string): string[] {
    if (!imageUrl || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return [];
    }

    const additionalImages: string[] = [];
    let imagePath = imageUrl.replace(/^\//, '');

    // Si la ruta no incluye 'eventos', agregarla
    if (!imagePath.includes('eventos/') && !imagePath.startsWith('http')) {
      // Extraer solo el nombre del archivo
      const fileName = imagePath.split('/').pop() || imagePath;
      imagePath = `images/eventos/${fileName}`;
    }

    // Extraer directorio, nombre base y extensión
    const pathMatch = imagePath.match(/^(.+\/)?(.+?)(\.[^.]+)$/);
    if (!pathMatch) {
      return [];
    }

    const directory = pathMatch[1] || '';
    const baseName = pathMatch[2];
    const extension = pathMatch[3];

    // Buscar imágenes con sufijo -2, -3, -4, etc. hasta -10
    for (let i = 2; i <= 10; i++) {
      const additionalImagePath = `${directory}${baseName}-${i}${extension}`;
      const fullPath = path.join(__dirname, '../../../public', additionalImagePath);

      if (fs.existsSync(fullPath)) {
        additionalImages.push(`/${additionalImagePath}`);
      } else {
        // Si no encontramos una imagen, dejar de buscar
        break;
      }
    }

    return additionalImages;
  }

  private static toEventResponse(event: Event): EventResponse {
    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      date: event.date,
      category: event.category,
      imageUrl: this.validateImageUrl(event.image_url),
      additionalImages: event.additional_images || [],
      summary: event.summary,
      context: event.context,
      keyFacts: event.key_facts,
      timeline: event.timeline,
      consequences: event.consequences,
      exam: event.exam,
    };
  }

  static async getAllEvents(): Promise<EventResponse[]> {
    const result = await query('SELECT * FROM events ORDER BY id DESC');
    return result.rows.map((event: Event) => this.toEventResponse(event));
  }

  static async getEventById(id: string): Promise<EventResponse> {
    const result = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new AppError('Event not found', 404);
    }
    return this.toEventResponse(result.rows[0] as Event);
  }

  /**
   * Obtiene un evento por su slug (URL-friendly)
   * @param slug - Slug del evento
   * @returns Evento encontrado
   */
  static async getEventBySlug(slug: string): Promise<EventResponse> {
    const result = await query('SELECT * FROM events WHERE slug = $1', [slug]);
    if (result.rows.length === 0) {
      throw new AppError('Event not found', 404);
    }
    return this.toEventResponse(result.rows[0] as Event);
  }

  static async getEventsByCategory(category: string): Promise<EventResponse[]> {
    const result = await query(
      'SELECT * FROM events WHERE LOWER(category) = LOWER($1) ORDER BY date DESC',
      [category],
    );
    return result.rows.map((event: Event) => this.toEventResponse(event));
  }

  static async searchEvents(searchTerm: string): Promise<EventResponse[]> {
    const result = await query(
      `SELECT * FROM events
       WHERE LOWER(title) LIKE LOWER($1)
          OR LOWER(category) LIKE LOWER($1)
          OR summary::text ILIKE $1
          OR context::text ILIKE $1
       ORDER BY date DESC`,
      [`%${searchTerm}%`],
    );
    return result.rows.map((event: Event) => this.toEventResponse(event));
  }

  static async getCategories(): Promise<string[]> {
    const result = await query('SELECT DISTINCT category FROM events ORDER BY category');
    return result.rows.map((row: { category: string }) => row.category);
  }

  /**
   * Convierte una fecha de formato dd-mm-yyyy a yyyy-mm-dd
   * También maneja fechas seriales de Excel (números)
   */
  private static convertDate(dateStr: string | number): string {
    // Si es un número (fecha serial de Excel), convertirla
    if (typeof dateStr === 'number') {
      const date = XLSX.SSF.parse_date_code(dateStr);
      const year = date.y;
      const month = String(date.m).padStart(2, '0');
      const day = String(date.d).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

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

    return dateString;
  }

  /**
   * Normaliza la ruta de la imagen
   * Asegura que tenga un / al inicio para rutas relativas
   */
  private static normalizeImageUrl(imageUrl: string): string {
    if (!imageUrl) return imageUrl;

    // Si ya es una URL absoluta (http/https), dejarla como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Para rutas relativas, asegurar que empiecen con /
    if (!imageUrl.startsWith('/')) {
      return `/${imageUrl}`;
    }

    return imageUrl;
  }

  /**
   * Procesa un archivo Excel y actualiza/crea eventos en la base de datos
   */
  static async processExcelUpload(buffer: Buffer): Promise<UploadResult> {
    const result: UploadResult = {
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      // Leer el archivo Excel desde el buffer
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convertir a JSON
      const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new AppError('El archivo Excel está vacío', 400);
      }

      // Procesar cada fila
      for (const row of data) {
        try {
          if (!row.id || !row.title) {
            result.errors.push(`Fila sin ID o título: ${JSON.stringify(row).substring(0, 100)}`);
            continue;
          }

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
                return { date: this.convertDate(date), event };
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
            : [];

          // Detectar imágenes adicionales automáticamente
          const normalizedImageUrl = this.normalizeImageUrl(row.imageUrl);
          const additionalImages = this.detectAdditionalImages(normalizedImageUrl);

          const eventData = {
            id: row.id,
            slug: generateEventSlug(row.title, this.convertDate(row.date)),
            title: row.title,
            date: this.convertDate(row.date),
            category: row.category,
            image_url: normalizedImageUrl,
            additional_images: JSON.stringify(additionalImages),
            summary: JSON.stringify(summary),
            context: JSON.stringify(context),
            key_facts: JSON.stringify(keyFacts),
            timeline: JSON.stringify(timeline),
            consequences: JSON.stringify(consequences),
            exam: exam.length > 0 ? JSON.stringify(exam) : null,
          };

          // Verificar si el evento ya existe
          const existingEvent = await query('SELECT id FROM events WHERE id = $1', [row.id]);

          if (existingEvent.rows.length > 0) {
            // Actualizar evento existente
            await query(
              `UPDATE events SET
                slug = $1,
                title = $2,
                date = $3,
                category = $4,
                image_url = $5,
                additional_images = $6::jsonb,
                summary = $7,
                context = $8,
                key_facts = $9,
                timeline = $10,
                consequences = $11,
                exam = $12::jsonb,
                updated_at = NOW()
              WHERE id = $13`,
              [
                eventData.slug,
                eventData.title,
                eventData.date,
                eventData.category,
                eventData.image_url,
                eventData.additional_images,
                eventData.summary,
                eventData.context,
                eventData.key_facts,
                eventData.timeline,
                eventData.consequences,
                eventData.exam,
                eventData.id,
              ],
            );
            result.updated++;
          } else {
            // Crear nuevo evento
            await query(
              `INSERT INTO events (id, slug, title, date, category, image_url, additional_images, summary, context, key_facts, timeline, consequences, exam)
               VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13::jsonb)`,
              [
                eventData.id,
                eventData.slug,
                eventData.title,
                eventData.date,
                eventData.category,
                eventData.image_url,
                eventData.additional_images,
                eventData.summary,
                eventData.context,
                eventData.key_facts,
                eventData.timeline,
                eventData.consequences,
                eventData.exam,
              ],
            );
            result.created++;
          }
        } catch (rowError: unknown) {
          const errorMessage = rowError instanceof Error ? rowError.message : 'Error desconocido';
          result.errors.push(`Error en evento ${row.id}: ${errorMessage}`);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error al procesar el archivo Excel', 500);
    }
  }
}

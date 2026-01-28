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
    };
  }

  static async getAllEvents(): Promise<EventResponse[]> {
    const result = await query('SELECT * FROM events ORDER BY date DESC');
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

          const eventData = {
            id: row.id,
            slug: generateEventSlug(row.title, this.convertDate(row.date)),
            title: row.title,
            date: this.convertDate(row.date),
            category: row.category,
            image_url: this.normalizeImageUrl(row.imageUrl),
            summary: JSON.stringify(summary),
            context: JSON.stringify(context),
            key_facts: JSON.stringify(keyFacts),
            timeline: JSON.stringify(timeline),
            consequences: JSON.stringify(consequences),
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
                summary = $6,
                context = $7,
                key_facts = $8,
                timeline = $9,
                consequences = $10,
                updated_at = NOW()
              WHERE id = $11`,
              [
                eventData.slug,
                eventData.title,
                eventData.date,
                eventData.category,
                eventData.image_url,
                eventData.summary,
                eventData.context,
                eventData.key_facts,
                eventData.timeline,
                eventData.consequences,
                eventData.id,
              ],
            );
            result.updated++;
          } else {
            // Crear nuevo evento
            await query(
              `INSERT INTO events (id, slug, title, date, category, image_url, summary, context, key_facts, timeline, consequences)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                eventData.id,
                eventData.slug,
                eventData.title,
                eventData.date,
                eventData.category,
                eventData.image_url,
                eventData.summary,
                eventData.context,
                eventData.key_facts,
                eventData.timeline,
                eventData.consequences,
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

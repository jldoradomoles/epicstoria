import { query } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { Event, EventResponse } from '../models/event.model';

export class EventService {
  private static toEventResponse(event: Event): EventResponse {
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      category: event.category,
      imageUrl: event.image_url,
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
}

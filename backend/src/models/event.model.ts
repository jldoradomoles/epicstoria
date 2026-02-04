export interface Event {
  id: string;
  slug: string; // URL-friendly identifier
  title: string;
  date: string;
  category: string;
  image_url: string;
  additional_images?: string[]; // URLs de imágenes adicionales (sufijos -1, -2, -3, etc.)
  summary: string | string[];
  context: string | string[];
  key_facts: EventFact[];
  timeline: TimelineItem[];
  consequences: string | string[];
  exam?: ExamQuestion[]; // Preguntas del examen (20 preguntas del Excel)
  created_at: Date;
  updated_at: Date;
}

export interface EventFact {
  title: string;
  description: string;
}

export interface TimelineItem {
  date: string;
  event: string;
}

export interface ExamQuestion {
  question: string;
  options: string[]; // 4 opciones
  correctAnswer: number; // índice de la opción correcta (0-3)
  explanation?: string; // explicación de la respuesta correcta
}

export interface EventResponse {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  additionalImages?: string[];
  summary: string | string[];
  context: string | string[];
  keyFacts: EventFact[];
  timeline: TimelineItem[];
  consequences: string | string[];
  exam?: ExamQuestion[];
}

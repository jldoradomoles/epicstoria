export interface Event {
  id: string;
  slug: string; // URL-friendly identifier (ej: 'llegada-hombre-luna-1969')
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  additionalImages?: string[]; // URLs de imágenes adicionales (sufijos -1, -2, -3, etc.)
  summary: string | string[]; // Puede ser un string o array de párrafos
  context: string | string[]; // Puede ser un string largo o array de párrafos
  keyFacts: EventFact[];
  timeline: TimelineItem[];
  consequences: string | string[]; // Puede ser un string largo o array de párrafos
  exam?: ExamQuestion[]; // Preguntas del examen (20 preguntas del Excel)
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

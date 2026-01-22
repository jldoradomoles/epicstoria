export interface Event {
  id: string;
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
}

export interface EventFact {
  title: string;
  description: string;
}

export interface TimelineItem {
  date: string;
  event: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
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

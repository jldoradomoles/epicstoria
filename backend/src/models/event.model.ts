export interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  image_url: string;
  summary: string | string[];
  context: string | string[];
  key_facts: EventFact[];
  timeline: TimelineItem[];
  consequences: string | string[];
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

export interface EventResponse {
  id: string;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
  summary: string | string[];
  context: string | string[];
  keyFacts: EventFact[];
  timeline: TimelineItem[];
  consequences: string | string[];
}

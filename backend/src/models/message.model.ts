export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  read: boolean;
  created_at: Date;
}

export interface MessageCreateDTO {
  sender_id: number;
  receiver_id: number;
  message: string;
}

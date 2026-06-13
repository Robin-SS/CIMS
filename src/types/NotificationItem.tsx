
export interface Notification {
  id: number;
  message: string;
  item_id: number | null;
  is_read: boolean;
  created_at: string;
} 
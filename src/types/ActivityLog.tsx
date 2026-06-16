export interface ActivityLog {
  id: number;
  user_id: number;
  log_id: string;
  activity: string;
  target: string;
  created_at: string;
}
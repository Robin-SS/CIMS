import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { ActivityLog } from '../types/ActivityLog';

export const ActivityService = {
  // 1. Fetch function
  async getRecentActivity() {
    const { data, error } = await supabase
      .from('activity_log') // using the singular name from your database screenshot
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return { data: data as ActivityLog[] | null, error };
  },


  async logAction(userId: number, activity: string, target: string) {
    const generatedLogId = `LOG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { error } = await supabase
      .from('activity_log') // using the singular name from your database screenshot
      .insert([
        {
          user_id: userId,
          log_id: generatedLogId,
          activity: activity,
          target: target
        }
      ]);

    if (error) {
      console.error("Failed to save activity log:", error.message);
    }
  }
};

// 3. The Hook
export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    async function fetchLogs() {
      setIsLoading(true);
      const { data, error } = await ActivityService.getRecentActivity();
      
      if (error) {
        console.error("Failed to fetch logs:", error);
        setError(error.message);
      } else {
        setLogs(data || []);
      }
      setIsLoading(false);
    }

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, isLoading, error, refetch: fetchLogs };
}
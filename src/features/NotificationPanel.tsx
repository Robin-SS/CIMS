import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Notification {
  id: number;
  message: string;
  item_id: number | null;
  is_read: boolean;
  created_at: string;
} 

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 2. Fetch existing unread notifications when the component mounts
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_read', false)
          .order('date_created', { ascending: false });

        if (error) throw error;
        if (data) setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // 3. Set up the Realtime subscription for incoming low stock alerts
    const channel = supabase
      .channel('low-stock-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen for new rows added by the DB trigger
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add the brand new notification directly to the top of the list
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    // 4. Cleanup subscription when the component unmounts to avoid memory leaks
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 5. Optional helper to mark an item as read/dismissed
  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      // Filter out the dismissed notification from the UI state
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div className="w-80 border border-gray-200 rounded-lg shadow-lg bg-white p-4">
      <div className="flex justify-between items-center border-b pb-2 mb-3">
        <h3 className="font-semibold text-gray-800">Inventory Alerts</h3>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {notifications.length}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-4">Loading alerts...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">All items fully stocked! ✅</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="flex justify-between items-start p-2.5 bg-red-50 hover:bg-red-100 border-l-4 border-red-500 rounded text-sm transition-colors"
            >
              <p className="text-gray-700 font-medium pr-2">{notif.message}</p>
              <button 
                onClick={() => markAsRead(notif.id)}
                className="text-gray-400 hover:text-gray-600 text-xs font-semibold"
                aria-label="Dismiss alert"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
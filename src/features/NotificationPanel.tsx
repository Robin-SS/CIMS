import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Notification } from '../types/NotificationItem';

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch active unread alerts sorting by your database date column key
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('is_read', false)
          .order('date_created', { ascending: false }); // Sync with database key

        if (error) throw error;
        if (data) setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // 2. Listen to active postgres changes on the notifications table
    const channel = supabase
      .channel('low-stock-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Maps keywords to exact status color modules matching your mockup specs
  const getNotificationStyle = (message: string) => {
    const text = (message || '').toLowerCase();
    
    if (text.includes('no stock') || text.includes('out of stock')) {
      return {
        backgroundColor: '#FF2C2C', // Solid Red Pill
        icon: <XCircle style={{ width: 18, height: 18, color: '#FF2C2C' }} />
      };
    }
    
    if (text.includes('low stock') || text.includes('running low')) {
      return {
        backgroundColor: '#FFC107', // Solid Yellow/Amber Pill
        icon: <AlertTriangle style={{ width: 18, height: 18, color: '#FFC107' }} />
      };
    }

    return {
      backgroundColor: '#09AA29', // Solid Green Pill
      icon: <CheckCircle style={{ width: 18, height: 18, color: '#09AA29' }} />
    };
  };

  const markAsRead = async (id: number) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #D3C9BE',
      padding: 20,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      boxSizing: 'border-box'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: 16,
        fontWeight: 800,
        color: '#1E1E1E',
        letterSpacing: 0.5,
        textAlign: 'left'
      }}>
        Notifications
      </h3>

      {loading ? (
        <p style={{ fontSize: 13, color: '#8A7E72', textAlign: 'center', fontStyle: 'italic', margin: '20px 0' }}>
          Loading alerts...
        </p>
      ) : notifications.length === 0 ? (
        <p style={{ fontSize: 13, color: '#8A7E72', textAlign: 'center', fontStyle: 'italic', margin: '20px 0' }}>
          All items fully stocked! ✅
        </p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxHeight: 340,
          overflowY: 'auto',
          paddingRight: 4
        }}>
          {notifications.map((notif) => {
            const styleProps = getNotificationStyle(notif.message);
            return (
              <div 
                key={notif.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: styleProps.backgroundColor,
                  padding: '12px 16px',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexGrow: 1, paddingRight: 16 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {styleProps.icon}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                    {notif.message}
                  </p>
                </div>
                <button 
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer',
                    opacity: 0.7
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
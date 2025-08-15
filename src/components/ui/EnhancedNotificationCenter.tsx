// src/components/ui/EnhancedNotificationCenter.tsx - Enhanced notification system
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2
} from 'lucide-react';
import { formatDate } from '../../utils';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationCenterProps {
  className?: string;
}

const EnhancedNotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications - in production this would come from your backend
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Review Cycle Deadline',
        message: 'Q2 2024 review cycle ends in 3 days. 5 team members haven\'t completed their assessments.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: false,
        priority: 'high',
        actionUrl: '/reviews'
      },
      {
        id: '2',
        type: 'success',
        title: 'Goal Achievement',
        message: 'Mike Davis has achieved his quarterly sales target of $250K.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'info',
        title: 'New Feature Available',
        message: 'Enhanced dashboard analytics with real-time metrics are now live.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'error',
        title: 'System Alert',
        message: 'Failed to sync data for 3 employees. Please check your connection.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: '5',
        type: 'info',
        title: 'Feedback Received',
        message: 'Sarah Johnson left positive feedback for your leadership skills.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        read: true,
        priority: 'medium',
        actionUrl: '/feedback'
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
            {highPriorityCount > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-gray-400 text-sm mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-700/50 transition-colors ${
                        !notification.read ? 'bg-gray-700/30' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full border ${getNotificationColor(notification.type)}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm">
                                {notification.title}
                                {notification.priority === 'high' && (
                                  <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                                    HIGH
                                  </span>
                                )}
                              </h4>
                              <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-gray-500 text-xs flex items-center">
                                  <Clock size={12} className="mr-1" />
                                  {formatDate(notification.timestamp)}
                                </p>
                                <div className="flex items-center space-x-1">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center"
                                    >
                                      <Eye size={12} className="mr-1" />
                                      Mark read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-gray-400 hover:text-red-400 text-xs"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-cyan-400 rounded-full ml-2 mt-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 bg-gray-750">
              <div className="flex items-center justify-between">
                <button
                  onClick={clearAll}
                  className="text-gray-400 hover:text-red-400 text-sm flex items-center"
                >
                  <Trash2 size={14} className="mr-1" />
                  Clear all
                </button>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedNotificationCenter;
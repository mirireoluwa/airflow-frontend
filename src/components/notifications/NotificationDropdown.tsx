import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ExternalLink } from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
  const { state, markNotificationAsRead, clearNotifications } = useAirflow();
  const [isOpen, setIsOpen] = useState(false);
  const [clickedNotification, setClickedNotification] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = state.notifications.filter(n => !n.read).length;

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

  const handleNotificationClick = (notification: any) => {
    setClickedNotification(notification.id);
    
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Small delay to show loading state
    setTimeout(() => {
      // Navigate based on notification type and content
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      } else {
        // Fallback navigation based on notification title/content
        const title = notification.title.toLowerCase();
        const message = notification.message.toLowerCase();
        
        if (title.includes('task assigned') || title.includes('task completed') || message.includes('task')) {
          navigate('/tasks');
        } else if (title.includes('project') || message.includes('project')) {
          navigate('/projects');
        } else if (title.includes('overdue')) {
          navigate('/tasks');
        } else {
          // Default to dashboard for other notifications
          navigate('/');
        }
      }
      
      setIsOpen(false);
      setClickedNotification(null);
    }, 150);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'warning':
        return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      case 'error':
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-blue-500 rounded-full" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
              {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-2 rounded-xl transition-colors ${
            unreadCount > 0 
              ? 'text-red-600 hover:text-red-700 hover:bg-red-50/60' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    state.notifications.forEach(n => {
                      if (!n.read) markNotificationAsRead(n.id);
                    });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {state.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    } ${clickedNotification === notification.id ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          !notification.read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-1 mt-2">
                          {clickedNotification === notification.id ? (
                            <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ExternalLink className="h-3 w-3 text-blue-500" />
                          )}
                          <span className="text-xs text-blue-600 font-medium">
                            {clickedNotification === notification.id ? 'Navigating...' : 'Click to view'}
                          </span>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{unreadCount} unread</span>
                <span>{state.notifications.length} total</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

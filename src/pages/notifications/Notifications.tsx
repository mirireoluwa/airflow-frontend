import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../utils/cn';

export function Notifications() {
  const { state, markNotificationAsRead, clearNotifications } = useAirflow();
  const navigate = useNavigate();
  const [clickedNotification, setClickedNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [showActions, setShowActions] = useState<string | null>(null);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  // Filter notifications based on search and filter
  const filteredNotifications = state.notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.read) ||
                         (filterType === 'read' && notification.read);
    
    return matchesSearch && matchesFilter;
  });

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
      
      setClickedNotification(null);
    }, 150);
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationStyle = (isRead: boolean) => {
    const baseStyle = "transition-all duration-300 hover:shadow-lg hover:scale-[1.01] rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/60";
    const readStyle = isRead ? "opacity-60" : "opacity-100";
    return `${baseStyle} ${readStyle}`;
  };

  const getNotificationDotColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const handleMarkAllRead = () => {
    state.notifications.forEach(n => {
      if (!n.read) markNotificationAsRead(n.id);
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    // This would need to be implemented in the context
    console.log('Delete notification:', notificationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <Bell className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 rounded-xl"
            />
          </div>
          <div className="flex space-x-2">
            {(['all', 'unread', 'read'] as const).map((filter) => (
              <Button
                key={filter}
                variant={filterType === filter ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterType(filter)}
                className="capitalize flex-1 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'We\'ll notify you when something happens'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-300 group relative",
                  getNotificationStyle(notification.read),
                  clickedNotification === notification.id && "opacity-75 scale-95"
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Colored dot indicator */}
                <div className={cn(
                  "absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full shadow-sm",
                  getNotificationDotColor(notification.type)
                )} />
                
                <div className="flex items-start space-x-4 ml-2">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0" onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className={cn(
                            "text-sm font-semibold line-clamp-1",
                            !notification.read ? "text-gray-900" : "text-gray-600"
                          )}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                          )}
                        </div>
                        <p className={cn(
                          "text-sm leading-relaxed line-clamp-2",
                          !notification.read ? "text-gray-700" : "text-gray-500"
                        )}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </span>
                          {clickedNotification === notification.id ? (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-medium">Navigating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="h-3 w-3" />
                              <span className="text-xs font-medium">Click to view</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(showActions === notification.id ? null : notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Dropdown */}
                {showActions === notification.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200/50 bg-white/50 rounded-xl p-2 ml-6">
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notification.id);
                            setShowActions(null);
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-1 rounded-xl"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                          setShowActions(null);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {state.notifications.length > 0 && (
        <div className="p-4 bg-white border-t border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{unreadCount} unread</span>
              <span>•</span>
              <span>{state.notifications.length} total</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 flex-1 rounded-xl"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

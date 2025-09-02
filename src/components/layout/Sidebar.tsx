 
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  Settings,
  X,
  Columns,
  LogOut,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAirflow } from '../../context/AirflowContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderOpen
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare
  },
  {
    name: 'Kanban Board',
    href: '/tasks/kanban',
    icon: Columns
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { logout, clearUsers, state } = useAirflow();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 glass-effect border-r border-white/20 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0',
          isCollapsed ? 'w-26' : 'w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:rounded-r-2xl lg:mr-2 lg:my-2 lg:h-[calc(100vh-1rem)]'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header with collapse toggle */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            )}
            <div className="flex items-center space-x-2">
              {/* Collapse toggle button - only show on desktop */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 hover:bg-white/60 rounded-xl transition-colors"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
              </button>
              {/* Mobile close button */}
              <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden p-2 hover:bg-white/60 rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-8 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/' || item.href === '/tasks'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-2xl text-sm font-medium transition-all duration-200 ease-out group',
                      isCollapsed ? 'justify-center px-4 py-4' : 'space-x-4 px-4 py-3',
                      isActive
                        ? 'text-red-600'
                        : 'text-gray-700 hover:text-gray-900'
                    )
                  }
                  onClick={() => {
                    // Close mobile menu on navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn(
                    'transition-transform duration-200',
                    isCollapsed ? 'h-6 w-6' : 'h-6 w-6',
                    'group-hover:scale-110'
                  )} />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>



          {/* Footer */}
          <div className={cn("border-t border-white/20", isCollapsed ? "p-3" : "p-6")}>
            {state.currentUser && (
              <div className={cn("mb-4", isCollapsed ? "space-y-2" : "space-y-3")}>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowLogoutModal(true)} 
                  className={cn(
                    "text-red-600 hover:text-red-700",
                    isCollapsed ? "w-full justify-center p-2" : "w-full justify-start"
                  )}
                  title={isCollapsed ? 'Logout' : undefined}
                >
                  <LogOut className={cn(isCollapsed ? "h-6 w-6" : "h-6 w-6")} />
                  {!isCollapsed && <span className="font-medium ml-4">Logout</span>}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={clearUsers} 
                  className={cn(
                    "text-orange-600 hover:text-orange-700",
                    isCollapsed ? "w-full justify-center p-2" : "w-full justify-start"
                  )}
                  title={isCollapsed ? 'Reset Users (Dev)' : undefined}
                >
                  <Trash2 className={cn(isCollapsed ? "h-6 w-6" : "h-6 w-6")} />
                  {!isCollapsed && <span className="font-medium ml-4">Reset Users (Dev)</span>}
                </Button>
              </div>
            )}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              {!isCollapsed ? (
                <>
                  <p className="text-xs font-medium text-gray-600 text-center">
                    Airflow v1.0.0
                  </p>
                  <p className="text-xs text-gray-400 text-center mt-1">
                    Constructed by Mirireoluwa
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-xs font-bold text-red-600">A</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Are you sure you want to logout?</h3>
              <p className="text-sm text-red-700 mt-1">
                You will need to sign in again to access your account.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowLogoutModal(false);
                logout();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

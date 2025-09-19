import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAirflow } from '../../context/AirflowContext';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { state } = useAirflow();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      
      // Removed search notification - not essential
    }
  };

  const humanizeRole = (role?: string) => (role ? role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');

  return (
    <header className="sticky top-0 z-40 px-4 lg:px-6 pt-2">
      <div className="glass-effect border border-white/20 rounded-2xl shadow-md px-6 lg:px-8 py-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/60"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <img src="/Airtel/Airtel_ido6_-mlV0_5.svg" alt="Airtel" className="h-8 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gradient">Airflow</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200/60">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-64 placeholder-gray-400"
            />
          </form>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/30">
            <div className="relative">
              <div className="h-9 w-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center yinka-accent">
                {state.currentUser?.avatar ? (
                  <img 
                    src={state.currentUser.avatar} 
                    alt="Profile" 
                    className="h-9 w-9 rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(state.currentUser?.name || '').split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                state.currentUser?.status === 'online' ? 'bg-green-500' :
                state.currentUser?.status === 'busy' ? 'bg-red-500' :
                state.currentUser?.status === 'offline' ? 'bg-gray-500' :
                'bg-blue-500'
              }`} />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">
                {state.currentUser?.name || 'Guest'}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">
                  {humanizeRole(state.currentUser?.role)}
                </p>
                {state.currentUser?.status === 'custom' && state.currentUser?.customStatus && (
                  <span className="text-xs text-blue-600">
                    {state.currentUser.customStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAirflow } from '../../context/AirflowContext';
import { Onboarding } from '../onboarding/Onboarding';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { state } = useAirflow();
  const currentUserId = state.currentUser?.id || '';
  const completedKey = currentUserId ? `airflow_onboarding_completed_${currentUserId}` : '';
  const shouldShowOnboarding = currentUserId && localStorage.getItem(completedKey) !== '1';
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {showOnboarding && currentUserId && (
        <Onboarding userId={currentUserId} onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AirflowProvider, useAirflow } from './context/AirflowContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Projects } from './pages/projects/Projects';
import { ProjectDetail } from './pages/projects/ProjectDetail';
import { ProjectEditPage } from './pages/projects/ProjectEditPage';
import { CreateProjectPage } from './pages/projects/CreateProjectPage';
import { Tasks } from './pages/tasks/Tasks';
import { TaskDetailPage } from './pages/tasks/TaskDetailPage';
import { CreateTaskPage } from './pages/tasks/CreateTaskPage';
import { Kanban } from './pages/tasks/Kanban';
import { Analytics } from './pages/analytics/Analytics';
import { Search } from './pages/search/Search';
import { Settings } from './pages/settings/Settings';
import { UserProfile } from './pages/users/UserProfile';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';

function ProtectedRoutes() {
  const { state } = useAirflow();
  const navigate = useNavigate();
  const location = useLocation();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  
  useEffect(() => {
    if (state.currentUser) {
      const userKey = (state.currentUser.email || 'guest').toLowerCase();
      
      // Check if this is the user's first time logging in
      const firstLoginKey = `airflow_first_login_${userKey}`;
      const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
      
      // Check if welcome has been shown today
      const todayKey = `airflow_welcome_${userKey}_${new Date().toISOString().slice(0,10)}`;
      const shownToday = localStorage.getItem(todayKey);
      
      // Show welcome if it's their first login OR if it hasn't been shown today
      if (!hasLoggedInBefore || !shownToday) {
        setWelcomeOpen(true);
        
        // Mark as logged in before
        if (!hasLoggedInBefore) {
          localStorage.setItem(firstLoginKey, '1');
        }
        
        // Mark as shown today
        localStorage.setItem(todayKey, '1');
      }
    }
  }, [state.currentUser]);



  const handleWelcomeClose = () => {
    setWelcomeOpen(false);
    // Ensure we're on the dashboard after welcome
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate('/', { replace: true });
    }
  };
  if (!state.currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  if (welcomeOpen) {
    return (
      <div className="fixed inset-0 z-50 animated-gradient-bg flex items-center justify-center">
        <div className="text-center px-8">
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-light text-gray-900 mb-4 animate-fade-in">Welcome to</h1>
            <h2 className="text-6xl md:text-8xl font-bold text-gradient mb-8 animate-fade-in-delayed">Airflow</h2>
            {state.currentUser?.name && (
              <p className="text-2xl md:text-3xl text-gray-600 font-light animate-fade-in-delayed">Hello, {state.currentUser.name.split(' ')[0]}</p>
            )}
            {state.currentUser && (
              <>
                <p className="text-lg md:text-xl text-gray-500 font-light animate-fade-in-delayed mt-2">
                  {!localStorage.getItem(`airflow_first_login_${state.currentUser.email?.toLowerCase()}`) 
                    ? "🎉 Welcome to your new workspace! 🎉" 
                    : "Great to see you again!"}
                </p>
                {!localStorage.getItem(`airflow_first_login_${state.currentUser.email?.toLowerCase()}`) && (
                  <p className="text-base md:text-lg text-gray-400 font-light animate-fade-in-delayed mt-2">
                    Your journey to better project management starts here
                  </p>
                )}
              </>
            )}
          </div>
          <button
            onClick={handleWelcomeClose}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-delayed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/create" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/create" element={<CreateTaskPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route 
          path="/tasks/kanban" 
          element={
            <ProtectedRoute requiredRole="kanban">
              <Kanban />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute requiredRole="analytics">
              <Analytics />
            </ProtectedRoute>
          } 
        />
        <Route path="/search" element={<Search />} />
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AirflowProvider>
        <Router>
          <ProtectedRoutes />
        </Router>
      </AirflowProvider>
    </ErrorBoundary>
  );
}

export default App;

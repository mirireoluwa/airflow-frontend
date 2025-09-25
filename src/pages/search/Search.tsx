import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FolderOpen, CheckSquare, User as UserIcon } from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { getAccessibleTasks, canAccessProjects } from '../../utils/roleUtils';
import { Card, CardContent } from '../../components/ui/Card';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';


export function Search() {
  const { state } = useAirflow();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();
  
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const humanizeRole = (role: string) => role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { projects: [], tasks: [], users: [] };

    const searchTerm = query.toLowerCase();
    const accessibleTasks = getAccessibleTasks(state.currentUser, state.tasks);

    const projects = canAccessProjects(state.currentUser) 
      ? state.projects.filter(project =>
          project.name.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm)
        )
      : [];

    const tasks = accessibleTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      (task.tags && task.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm)))
    );

    const users = state.users
      .filter(user => user.id !== state.currentUser?.id)
      .filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.department && user.department.toLowerCase().includes(searchTerm))
      );

    return { projects, tasks, users };
  }, [query, state.projects, state.tasks, state.users, state.currentUser]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleTaskClick = () => {
    navigate(`/tasks`);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const totalResults = searchResults.projects.length + searchResults.tasks.length + searchResults.users.length;

  // Removed page view notification - not essential

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-2xl md:text-4xl font-bold text-gradient mb-2">Search Results</h1>
        <p className="text-sm md:text-lg text-gray-600">
          {query ? `Showing results for "${query}"` : 'Enter a search term to find projects, tasks, and users'}
        </p>
      </div>

      {/* Mobile Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="md:hidden flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200/60"
      >
        <SearchIcon className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects, tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-400"
        />
      </form>

      {/* Results */}
      {query && (
        <>
          {/* Results Summary */}
          <div className="text-xs md:text-sm text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </div>

          {totalResults === 0 ? (
            <Card variant="flat">
              <CardContent className="pt-6 text-center py-12">
                <SearchIcon className="h-10 w-10 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-sm md:text-base text-gray-600">Try adjusting your search terms or check spelling.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects */}
              {searchResults.projects.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-base md:text-xl font-semibold text-gray-900 flex items-center">
                    <FolderOpen className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-600" />
                    Projects ({searchResults.projects.length})
                  </h2>
                  <div className="space-y-3">
                    {searchResults.projects.map((project) => (
                      <Card 
                        key={project.id} 
                        variant="flat"
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <CardContent className="pt-4 p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{project.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500">
                            <span className="capitalize">{project.status}</span>
                            <span>{project.progress}% complete</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {searchResults.tasks.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-base md:text-xl font-semibold text-gray-900 flex items-center">
                    <CheckSquare className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-600" />
                    Tasks ({searchResults.tasks.length})
                  </h2>
                  <div className="space-y-3">
                    {searchResults.tasks.map((task) => (
                      <Card 
                        key={task.id} 
                        variant="flat"
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={handleTaskClick}
                      >
                        <CardContent className="pt-4 p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{task.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 mb-2">
                            <span className={`px-2 py-1 rounded-full ${
                              task.status === 'done' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                              task.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.assignee && (
                            <p className="text-[11px] md:text-xs text-gray-500">
                              Assigned to: {task.assignee.name}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-base md:text-xl font-semibold text-gray-900 flex items-center">
                    <UserIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 text-red-600" />
                    Users ({searchResults.users.length})
                  </h2>
                  <div className="space-y-3">
                    {searchResults.users.map((user) => (
                      <Card 
                        key={user.id} 
                        variant="flat"
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleUserClick(user.id)}
                      >
                        <CardContent className="pt-4 p-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm md:text-base">{user.name}</h3>
                              <p className="text-xs md:text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-[11px] md:text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                  {humanizeRole(user.role)}
                                </span>
                                {user.department && (
                                  <span className="text-[11px] md:text-xs text-gray-500">
                                    {user.department}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

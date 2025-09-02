import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, FolderOpen, CheckSquare, User as UserIcon } from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { User } from '../../types';

export function Search() {
  const { state, getScopedTasks } = useAirflow();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const navigate = useNavigate();
  
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { projects: [], tasks: [], users: [] };

    const searchTerm = query.toLowerCase();
    const scopedTasks = getScopedTasks();

    const projects = state.projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm) ||
      project.description.toLowerCase().includes(searchTerm)
    );

    const tasks = scopedTasks.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    const users = state.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.department && user.department.toLowerCase().includes(searchTerm))
    );

    return { projects, tasks, users };
  }, [query, state.projects, state.users, getScopedTasks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

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
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-gradient mb-2">Search Results</h1>
        <p className="text-lg text-gray-600">
          {query ? `Showing results for "${query}"` : 'Enter a search term to find projects, tasks, and users'}
        </p>
      </div>

      {/* Search Form */}
      <Card variant="flat">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="Search projects, tasks, users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="primary">
              <SearchIcon className="h-5 w-5 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {query && (
        <>
          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </div>

          {totalResults === 0 ? (
            <Card variant="flat">
              <CardContent className="pt-6 text-center py-12">
                <SearchIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or check spelling.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects */}
              {searchResults.projects.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2 text-red-600" />
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
                          <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
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
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <CheckSquare className="h-5 w-5 mr-2 text-red-600" />
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
                          <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
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
                            <p className="text-xs text-gray-500">
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
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-red-600" />
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
                            <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{user.name}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                                  {user.role}
                                </span>
                                {user.department && (
                                  <span className="text-xs text-gray-500">
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

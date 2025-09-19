import { Plus, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EnhancedProjectCard } from '../../components/projects/EnhancedProjectCard';
import { useAirflow } from '../../context/AirflowContext';

export function Projects() {
  const { state } = useAirflow();
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/projects/create');
  };


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gradient mb-2">Projects</h1>
          <p className="text-lg text-gray-600">Manage your projects and track their progress.</p>
        </div>
        <Button onClick={handleCreateProject} variant="apple-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {state.projects.length === 0 ? (
        <Card variant="flat">
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
            <Button onClick={handleCreateProject} variant="apple-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {state.projects.map((project) => (
            <EnhancedProjectCard 
              key={project.id} 
              project={project} 
              onClick={(project) => navigate(`/projects/${project.id}`)}
              onEdit={(project) => navigate(`/projects/${project.id}/edit`)}
              onDelete={() => {
                if (window.confirm('Are you sure you want to delete this project?')) {
                  // Add delete logic here if needed
                }
              }}
            />
          ))}
        </div>
      )}


      {/* Edit Project Modal */}
    </div>
  );
}


import React, { useState, useMemo } from 'react';
import Modal from '../Modal';
import { UserProfile, Project } from '../../types';
import { supabase } from '../../lib/supabaseClient';

interface ProjectsPageProps {
  viewedUser: UserProfile;
  allProjects: Project[];
  allUsers: UserProfile[];
  refreshProjects: () => void;
  onDeleteProject: (projectId: number) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
    case 'On Time':
       return 'bg-blue-200 text-blue-800';
    case 'Completed': return 'bg-green-200 text-green-800';
    case 'On Hold':
    case 'Slight Delay':
      return 'bg-yellow-200 text-yellow-800';
    case 'Planning': return 'bg-gray-200 text-gray-800';
    case 'Behind Schedule': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const ProjectsPage: React.FC<ProjectsPageProps> = ({ viewedUser, allProjects, allUsers, refreshProjects, onDeleteProject }) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectTeam, setNewProjectTeam] = useState<number[]>([]);

  const isAdmin = viewedUser.title.includes('(Admin)');
  const canCreateProject = isAdmin || viewedUser.title.includes('(Staff)');

  const visibleProjects = useMemo(() => {
    if (isAdmin) {
      return allProjects;
    }
    return allProjects.filter(p => p.team.includes(viewedUser.id));
  }, [viewedUser, allProjects, isAdmin]);

  const openCreateModal = () => {
    setNewProjectTeam([viewedUser.id]); // Creator is on the team by default
    setCreateModalOpen(true);
  };

  const handleTeamMemberToggle = (userId: number) => {
    setNewProjectTeam(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
  };
  
  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as typeof e.target & {
        projectName: { value: string },
    };
    const newProject = {
        name: target.projectName.value,
        status: 'On Time',
        progress: 0,
        budget_utilization: 0,
        milestones: [],
        team: newProjectTeam,
    };

    const { error } = await supabase.from('projects').insert([newProject]);
    if (error) {
      alert("Failed to create project: " + error.message);
    } else {
      alert("Project created successfully!");
      refreshProjects();
      setCreateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">Projects</h2>
        {canCreateProject && (
          <button onClick={openCreateModal} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
            Create New Project
          </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Project Name</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Progress</th>
                <th scope="col" className="px-6 py-3">Budget Used</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr key={project.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{project.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                      </div>
                      <span>{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{project.budget_utilization || project.budgetUtilization}%</td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    <button onClick={() => handleViewDetails(project)} className="font-medium text-blue-600 hover:underline">View Details</button>
                    {isAdmin && (
                        <button onClick={() => onDeleteProject(project.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
              <input type="text" name="projectName" id="projectName" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Assign Team Members</label>
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                  {allUsers.map(user => (
                      <div key={user.id} className="flex items-center">
                          <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={newProjectTeam.includes(user.id)}
                              onChange={() => handleTeamMemberToggle(user.id)}
                              className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                          />
                          <label htmlFor={`user-${user.id}`} className="ml-2 block text-sm text-gray-900">
                              {user.name} ({user.title})
                          </label>
                      </div>
                  ))}
              </div>
            </div>
          </div>
          <div className="text-right mt-6">
            <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Create Project</button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {selectedProject && (
        <Modal isOpen={isDetailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Project Details">
            <div className="space-y-2">
                <p><strong>Name:</strong> {selectedProject.name}</p>
                <p><strong>Status:</strong> {selectedProject.status}</p>
                <p><strong>Progress:</strong> {selectedProject.progress}%</p>
                <p><strong>Budget Utilization:</strong> {selectedProject.budget_utilization || selectedProject.budgetUtilization}%</p>
                <h4 className="font-bold mt-4">Milestones:</h4>
                <ul className="list-disc list-inside text-sm">
                    {(selectedProject.milestones || []).map((m: any) => <li key={m.name}>{m.name} ({m.status}) - Due: {m.dueDate}</li>)}
                </ul>
            </div>
             <div className="text-right mt-6">
                <button onClick={() => setDetailsModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors text-sm">Close</button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectsPage;

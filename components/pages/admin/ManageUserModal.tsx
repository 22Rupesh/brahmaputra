import React, { useState, useEffect } from 'react';
import Modal from '../../Modal';
import { UserProfile, Kpi, Task, Project } from '../../../types';

interface ManageUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile;
    onSave: (updatedUser: UserProfile) => void;
    allProjects: Project[];
    onSaveProjectAssignments: (userId: number, assignments: Record<number, boolean>) => Promise<void>;
}

type ActiveTab = 'profile' | 'kpis' | 'tasks' | 'projects';

const ManageUserModal: React.FC<ManageUserModalProps> = ({ isOpen, onClose, user, onSave, allProjects, onSaveProjectAssignments }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
    const [editedUser, setEditedUser] = useState<UserProfile>(user);
    const [projectAssignments, setProjectAssignments] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setEditedUser(user);
            setActiveTab('profile');
            const initialAssignments = allProjects.reduce((acc, project) => {
                acc[project.id] = project.team.includes(user.id);
                return acc;
            }, {} as Record<number, boolean>);
            setProjectAssignments(initialAssignments);
        }
    }, [isOpen, user, allProjects]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    const handleKpiChange = (index: number, field: keyof Kpi, value: string) => {
        const newKpis = [...editedUser.quantitativeKpis];
        // @ts-ignore
        newKpis[index][field] = value;
        setEditedUser({ ...editedUser, quantitativeKpis: newKpis });
    };

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const taskNameInput = form.elements.namedItem('taskName') as HTMLInputElement;
        const projectNameInput = form.elements.namedItem('projectName') as HTMLInputElement;
        const dueDateInput = form.elements.namedItem('dueDate') as HTMLInputElement;

        if (!dueDateInput.value || isNaN(new Date(dueDateInput.value).getTime())) {
            alert('Please select a valid due date.');
            return;
        }

        const newTask: Task = {
            id: Date.now(),
            name: taskNameInput.value,
            projectName: projectNameInput.value,
            dueDate: dueDateInput.value,
            status: 'Pending',
        };
        setEditedUser({ ...editedUser, tasks: [...editedUser.tasks, newTask] });
        form.reset();
    };
    
    const handleRemoveTask = (taskId: number) => {
        setEditedUser({ ...editedUser, tasks: editedUser.tasks.filter(t => t.id !== taskId)});
    };
    
    const handleProjectToggle = (projectId: number) => {
        setProjectAssignments(prev => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    const handleSaveChanges = async () => {
        // Run both save operations concurrently
        await Promise.all([
            onSave(editedUser),
            onSaveProjectAssignments(user.id, projectAssignments)
        ]);
        onClose();
    };

    const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === tab ? 'bg-white border-b-0 border text-brand-accent' : 'bg-gray-100 text-gray-600'}`}
        >
            {label}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Manage User: ${user.name}`}>
            <div className="border-b border-gray-200 -mt-4">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    <TabButton tab="profile" label="Edit Profile" />
                    <TabButton tab="kpis" label="Manage KPIs" />
                    <TabButton tab="tasks" label="Assign Tasks" />
                    <TabButton tab="projects" label="Projects" />
                </nav>
            </div>
            <div className="pt-6 min-h-[300px]">
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="name" value={editedUser.name} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" value={editedUser.email || ''} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" name="title" value={editedUser.title} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Division</label>
                                <select name="division" value={editedUser.division} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent">
                                    <option>HQ</option><option>Planning</option><option>Design</option><option>Finance</option><option>Field Operations</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Region</label>
                                <select name="region" value={editedUser.region} onChange={handleProfileChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent">
                                    <option>North</option><option>South</option><option>East</option><option>West</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'kpis' && (
                    <div className="space-y-2">
                        {editedUser.quantitativeKpis.map((kpi, index) => (
                            <div key={index} className="grid grid-cols-3 gap-2 items-center text-sm p-2 bg-gray-50 rounded">
                                <input value={kpi.name} onChange={(e) => handleKpiChange(index, 'name', e.target.value)} className="col-span-1 border-gray-300 rounded-md shadow-sm p-1 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                                <div className="flex items-center">Target: <input value={kpi.target} onChange={(e) => handleKpiChange(index, 'target', e.target.value)} className="w-16 ml-1 border-gray-300 rounded-md shadow-sm p-1 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/></div>
                                <div className="flex items-center">Weight: <input value={kpi.weight} onChange={(e) => handleKpiChange(index, 'weight', e.target.value)} className="w-16 ml-1 border-gray-300 rounded-md shadow-sm p-1 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/></div>
                            </div>
                        ))}
                         <button className="text-sm text-blue-600 hover:underline mt-2">+ Add KPI</button>
                    </div>
                )}
                 {activeTab === 'tasks' && (
                     <div className="space-y-4">
                        <form onSubmit={handleAddTask} className="grid grid-cols-3 gap-2 items-end p-2 bg-gray-50 rounded">
                            <input name="taskName" placeholder="Task Name" required className="col-span-3 border-gray-300 rounded-md shadow-sm p-2 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            <input name="projectName" placeholder="Project Name" required className="border-gray-300 rounded-md shadow-sm p-2 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            <input name="dueDate" type="date" required className="border-gray-300 rounded-md shadow-sm p-2 bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
                            <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white text-sm font-bold py-2 px-2 rounded-md transition-colors">Add Task</button>
                        </form>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                           {editedUser.tasks.map(task => (
                                <div key={task.id} className="flex justify-between items-center text-sm p-2 border rounded">
                                    <p>{task.name} ({task.projectName}) - Due: {task.dueDate}</p>
                                    <button onClick={() => handleRemoveTask(task.id)} className="text-red-500 font-bold">&times;</button>
                                </div>
                            ))}
                        </div>
                     </div>
                )}
                {activeTab === 'projects' && (
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Assign Projects</h4>
                        <div className="max-h-64 overflow-y-auto space-y-2 border p-3 rounded-md">
                            {allProjects.map(project => (
                                <div key={project.id} className="flex items-center">
                                    <input 
                                        type="checkbox"
                                        id={`project-${project.id}`}
                                        checked={projectAssignments[project.id] || false}
                                        onChange={() => handleProjectToggle(project.id)}
                                        className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                                    />
                                    <label htmlFor={`project-${project.id}`} className="ml-2 block text-sm text-gray-900">
                                        {project.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors text-sm">Cancel</button>
                <button onClick={handleSaveChanges} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Save Changes</button>
            </div>
        </Modal>
    );
};

export default ManageUserModal;
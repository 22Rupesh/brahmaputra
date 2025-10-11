
import React, { useState, useMemo, useRef } from 'react';
import { UserProfile, DprTask, Project } from '../../types';
import Modal from '../Modal';

interface DprPageProps {
  viewedUser: UserProfile;
  allUsers: UserProfile[];
  allProjects: Project[];
  allDprTasks: DprTask[];
  onCreateTask: (task: Omit<DprTask, 'id' | 'status' | 'evidenceUrl'>, evidenceFile: File | null) => Promise<void>;
  onUpdateTask: (taskId: number, status: DprTask['status'], mentorNotes?: string) => Promise<void>;
}

const DprPage: React.FC<DprPageProps> = ({ viewedUser, allUsers, allProjects, allDprTasks, onCreateTask, onUpdateTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskProject, setNewTaskProject] = useState<string>('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingTask, setRejectingTask] = useState<DprTask | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const isManager = viewedUser.title.includes('(Admin)') || viewedUser.title.includes('(Staff)');

  const teamMembers = useMemo(() => {
    if (!isManager) return [];
    return allUsers.filter(u => u.division === viewedUser.division && u.id !== viewedUser.id);
  }, [allUsers, viewedUser, isManager]);

  const userToView = useMemo(() => {
    if (!isManager) return viewedUser;
    // Set default view to the manager themselves if no one is selected
    if (!selectedTeamMemberId) return viewedUser;
    return allUsers.find(u => u.id === parseInt(selectedTeamMemberId, 10)) || null;
  }, [isManager, viewedUser, allUsers, selectedTeamMemberId]);

  const userProjects = useMemo(() => {
    const targetUser = isManager ? userToView : viewedUser;
    if (!targetUser) return [];
    return allProjects.filter(p => p.team.includes(targetUser.id));
  }, [allProjects, viewedUser, isManager, userToView]);

  const tasksForDate = useMemo(() => {
    if (!userToView) return [];
    return allDprTasks.filter(t => t.userId === userToView.id && t.taskDate === selectedDate);
  }, [allDprTasks, userToView, selectedDate]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc || !newTaskProject) {
      alert("Please provide a description and select a project.");
      return;
    }
    onCreateTask({
      userId: viewedUser.id,
      taskDate: selectedDate,
      description: newTaskDesc,
      projectId: parseInt(newTaskProject, 10),
    }, evidenceFile);
    setNewTaskDesc('');
    setNewTaskProject('');
    setEvidenceFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const openRejectModal = (task: DprTask) => {
    setRejectingTask(task);
    setRejectModalOpen(true);
  };
  
  const handleRejectSubmit = () => {
    if (rejectingTask) {
      onUpdateTask(rejectingTask.id, 'Rejected', rejectionNotes);
      setRejectModalOpen(false);
      setRejectionNotes('');
      setRejectingTask(null);
    }
  };
  
  const getProjectName = (projectId: number) => allProjects.find(p => p.id === projectId)?.name || 'Unknown Project';

  const getStatusChip = (status: DprTask['status']) => {
    const colors = {
      Pending: 'bg-gray-200 text-gray-800',
      Completed: 'bg-blue-200 text-blue-800',
      Approved: 'bg-green-200 text-green-800',
      Rejected: 'bg-red-200 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>{status}</span>;
  };

  const recentDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date);
    }
    return dates.reverse();
  }, []);

  const CalendarStrip = () => (
    <div className="bg-white p-3 rounded-lg shadow-sm border overflow-hidden">
        <div className="flex space-x-2 items-center overflow-x-auto pb-2">
            {recentDates.map(date => {
                const dateString = date.toLocaleDateString('en-CA');
                const isActive = dateString === selectedDate;
                return (
                    <button
                        key={dateString}
                        onClick={() => setSelectedDate(dateString)}
                        className={`flex-shrink-0 text-center p-2 rounded-md transition-colors w-20 ${isActive ? 'bg-brand-accent text-white shadow' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                        <p className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p className="font-bold text-lg">{date.getDate()}</p>
                    </button>
                )
            })}
            <input 
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="ml-2 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent text-sm"
            />
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-brand-dark">Daily Progress Report</h2>
        {isManager && (
            <select 
                value={selectedTeamMemberId}
                onChange={e => setSelectedTeamMemberId(e.target.value)}
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent text-sm"
            >
                <option value={viewedUser.id}>View My DPR</option>
                {teamMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
        )}
      </div>

      <CalendarStrip />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-brand-dark">
            {userToView ? `Tasks for ${userToView.name} on ${new Date(selectedDate.replace(/-/g, '\/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Select a team member to view their DPR'}
          </h3>
          {tasksForDate.length > 0 ? tasksForDate.map(task => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                          <p className="text-gray-800">{task.description}</p>
                          <p className="text-xs text-gray-500">Project: {getProjectName(task.projectId)}</p>
                          {task.evidenceUrl && (
                            <div className="mt-2">
                                <a 
                                    href={task.evidenceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    View Evidence
                                </a>
                            </div>
                          )}
                          {task.status === 'Rejected' && task.mentorNotes && (
                              <p className="text-xs text-red-600 mt-1 p-2 bg-red-50 rounded-md"><strong>Mentor Note:</strong> {task.mentorNotes}</p>
                          )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusChip(task.status)}
                      </div>
                  </div>
                  {(isManager && userToView?.id !== viewedUser.id) && task.status === 'Completed' && (
                       <div className="border-t mt-3 pt-3 flex justify-end gap-2">
                          <button onClick={() => openRejectModal(task)} className="text-sm bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded-md">Reject</button>
                          <button onClick={() => onUpdateTask(task.id, 'Approved')} className="text-sm bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-3 rounded-md">Approve</button>
                      </div>
                  )}
                  {userToView?.id === viewedUser.id && task.status === 'Pending' && (
                      <div className="border-t mt-3 pt-3 flex justify-end">
                          <button onClick={() => onUpdateTask(task.id, 'Completed')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md">Mark as Complete</button>
                      </div>
                  )}
              </div>
          )) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{userToView ? 'No tasks found' : 'No team member selected'}</h3>
                  <p className="mt-1 text-sm text-gray-500">{userToView ? 'No tasks were logged for this date.' : 'Please select a team member from the dropdown above.'}</p>
              </div>
          )}
        </div>
        {(userToView?.id === viewedUser.id) && (
          <div className="bg-white p-6 rounded-lg shadow-md border h-fit">
              <h3 className="text-lg font-bold text-brand-dark mb-4">Add New Task for {new Date(selectedDate.replace(/-/g, '\/')).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})}</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Task Description</label>
                      <textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} required rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent" placeholder="e.g., Conducted site visit and prepared the report."/>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Project</label>
                      <select value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-accent focus:border-brand-accent">
                          <option value="">Select Project</option>
                          {userProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Attach Evidence (Optional)</label>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={(e) => setEvidenceFile(e.target.files ? e.target.files[0] : null)}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent-light file:text-brand-accent hover:file:bg-teal-100"
                    />
                  </div>
                  <button type="submit" className="w-full bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Add Task to DPR</button>
              </form>
          </div>
        )}
      </div>
      
      <Modal isOpen={isRejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Task">
        <p className="text-sm text-gray-600 mb-2">Please provide a reason for rejecting this task. The user will see these notes.</p>
        <textarea value={rejectionNotes} onChange={e => setRejectionNotes(e.target.value)} rows={4} className="w-full border p-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent" placeholder="e.g., Please provide more details or attach the report."/>
        <div className="mt-4 flex justify-end gap-3">
            <button onClick={() => setRejectModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md text-sm">Cancel</button>
            <button onClick={handleRejectSubmit} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm">Confirm Rejection</button>
        </div>
      </Modal>

    </div>
  );
};

export default DprPage;

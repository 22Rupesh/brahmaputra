import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, Sepeal } from '../../types';
import Modal from '../Modal';

interface SepealsPageProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  allSepeals: Sepeal[];
  onCreate: (sepeal: Omit<Sepeal, 'id' | 'createdAt'>) => Promise<void>;
  onUpdate: (sepeal: Sepeal) => Promise<void>;
  onDelete: (sepealId: number) => Promise<void>;
}

const getStatusColor = (status: Sepeal['status']) => {
    switch (status) {
        case 'New': return 'bg-blue-200 text-blue-800';
        case 'Under Review': return 'bg-yellow-200 text-yellow-800';
        case 'Resolved': return 'bg-green-200 text-green-800';
        case 'Closed': return 'bg-gray-200 text-gray-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const getPriorityColor = (priority: Sepeal['priority']) => {
    switch (priority) {
        case 'High': return 'bg-red-200 text-red-800';
        case 'Medium': return 'bg-yellow-200 text-yellow-800';
        case 'Low': return 'bg-green-200 text-green-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const SepealsPage: React.FC<SepealsPageProps> = ({ currentUser, allUsers, allSepeals, onCreate, onUpdate, onDelete }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSepeal, setEditingSepeal] = useState<Partial<Sepeal> | null>(null);

  const isAdmin = currentUser.title.includes('(Admin)');

  const visibleSepeals = useMemo(() => {
    if (isAdmin) {
      return allSepeals;
    }
    return allSepeals.filter(s => s.assignedToId === currentUser.id);
  }, [allSepeals, currentUser, isAdmin]);

  const openModal = (sepeal: Partial<Sepeal> | null = null) => {
    setEditingSepeal(sepeal || { subject: '', description: '', priority: 'Medium', status: 'New', assignedToId: null });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editingSepeal?.subject && editingSepeal.priority && editingSepeal.status) {
        if (editingSepeal.id) {
            // This is an update
            await onUpdate(editingSepeal as Sepeal);
        } else {
            // This is a creation
            await onCreate(editingSepeal as Omit<Sepeal, 'id' | 'createdAt'>);
        }
        setModalOpen(false);
        setEditingSepeal(null);
    } else {
        alert("Please fill in all required fields (Subject, Priority, Status).");
    }
  };
  
  const handleDelete = (sepealId: number) => {
      if(window.confirm("Are you sure you want to delete this SEPEAL? This action cannot be undone.")){
          onDelete(sepealId);
      }
  }

  const getUserNameById = (id: number | null) => {
    if (!id) return <span className="text-gray-400 italic">Unassigned</span>;
    return allUsers.find(u => u.id === id)?.name || 'Unknown User';
  };

  const EditModal = () => {
    if (!editingSepeal) return null;

    const handleFieldChange = (field: keyof Sepeal, value: any) => {
        setEditingSepeal(prev => ({...prev, [field]: value }));
    };

    return (
        <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingSepeal.id ? 'Edit SEPEAL' : 'Create New SEPEAL'}>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input type="text" value={editingSepeal.subject} onChange={e => handleFieldChange('subject', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={editingSepeal.description || ''} onChange={e => handleFieldChange('description', e.target.value)} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select value={editingSepeal.priority} onChange={e => handleFieldChange('priority', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={editingSepeal.status} onChange={e => handleFieldChange('status', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                            <option value="New">New</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <select value={editingSepeal.assignedToId || ''} onChange={e => handleFieldChange('assignedToId', e.target.value ? parseInt(e.target.value, 10) : null)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent">
                        <option value="">Unassigned</option>
                        {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors text-sm">Cancel</button>
                <button onClick={handleSave} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Save Changes</button>
            </div>
        </Modal>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">Special Appeals (SEPEALS)</h2>
        {isAdmin && (
            <button onClick={() => openModal()} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Create New SEPEAL
            </button>
        )}
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Subject</th>
                <th scope="col" className="px-6 py-3">Assigned To</th>
                <th scope="col" className="px-6 py-3">Date Created</th>
                <th scope="col" className="px-6 py-3">Priority</th>
                <th scope="col" className="px-6 py-3">Status</th>
                {isAdmin && <th scope="col" className="px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleSepeals.map((sepeal) => (
                <tr key={sepeal.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sepeal.subject}</td>
                  <td className="px-6 py-4">{getUserNameById(sepeal.assignedToId)}</td>
                  <td className="px-6 py-4">{new Date(sepeal.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(sepeal.priority)}`}>
                        {sepeal.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(sepeal.status)}`}>
                        {sepeal.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                        <button onClick={() => openModal(sepeal)} className="font-medium text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(sepeal.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {visibleSepeals.length === 0 && <p className="text-center text-gray-500 py-8">No SEPEALS found.</p>}
        </div>
      </div>
      {isModalOpen && <EditModal />}
    </div>
  );
};

export default SepealsPage;
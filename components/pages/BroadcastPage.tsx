import React, { useState, useMemo } from 'react';
import { UserProfile, Broadcast } from '../../types';
import Modal from '../Modal';

interface BroadcastPageProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  allBroadcasts: Broadcast[];
  onCreateBroadcast: (broadcast: Omit<Broadcast, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteBroadcast: (broadcastId: number) => Promise<void>;
}

const BroadcastPage: React.FC<BroadcastPageProps> = ({ currentUser, allUsers, allBroadcasts, onCreateBroadcast, onDeleteBroadcast }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<number[]>([]);

  const isAdmin = currentUser.title.includes('(Admin)');

  const availableUsers = useMemo(() => {
    return allUsers.filter(u => u.id !== currentUser.id && !u.title.includes('(Admin)'));
  }, [allUsers, currentUser]);

  const openCreateModal = () => {
    setTitle('');
    setMessage('');
    setTargetAudience([]);
    setModalOpen(true);
  };

  const handleAudienceToggle = (userId: number) => {
    setTargetAudience(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setTargetAudience(availableUsers.map(u => u.id));
    } else {
      setTargetAudience([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || targetAudience.length === 0) {
      alert('Please fill in all fields and select at least one recipient.');
      return;
    }
    await onCreateBroadcast({
      title,
      message,
      targetAudience: targetAudience,
    });
    setModalOpen(false);
  };
  
  const getUserNamesFromIds = (ids: number[]) => {
    if (ids.length === availableUsers.length) return 'All Users';
    if (ids.length === 0) return 'Nobody';
    const names = ids.map(id => allUsers.find(u => u.id === id)?.name || 'Unknown');
    return names.join(', ');
  };

  if (!isAdmin) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold text-brand-dark">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">Broadcast Messages</h2>
        <button onClick={openCreateModal} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
          Create New Broadcast
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-brand-dark mb-4">Sent Broadcasts</h3>
        <div className="space-y-4">
          {allBroadcasts.map(broadcast => (
            <div key={broadcast.id} className="border rounded-lg p-4 relative group">
              <button
                onClick={() => onDeleteBroadcast(broadcast.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Broadcast"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <p className="text-xs text-gray-500">{new Date(broadcast.createdAt).toLocaleString()}</p>
              <h4 className="font-bold text-brand-dark mt-1">{broadcast.title}</h4>
              <p className="text-sm text-gray-700 mt-2">{broadcast.message}</p>
              <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
                <strong>Sent to:</strong> {getUserNamesFromIds(broadcast.targetAudience)}
              </p>
            </div>
          ))}
          {allBroadcasts.length === 0 && (
            <p className="text-center text-gray-500 py-8">No broadcasts have been sent yet.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create New Broadcast">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="broadcast-title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="broadcast-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            />
          </div>
          <div>
            <label htmlFor="broadcast-message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="broadcast-message"
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Target Audience</label>
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              <div className="flex items-center border-b pb-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={targetAudience.length === availableUsers.length && availableUsers.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                />
                <label htmlFor="select-all" className="ml-3 block text-sm font-bold text-gray-900">
                  Select All Users
                </label>
              </div>
              {availableUsers.map(user => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={targetAudience.includes(user.id)}
                    onChange={() => handleAudienceToggle(user.id)}
                    className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                  />
                  <label htmlFor={`user-${user.id}`} className="ml-3 block text-sm text-gray-900">
                    {user.name} <span className="text-gray-500">({user.title})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right mt-6">
            <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
              Send Broadcast
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BroadcastPage;

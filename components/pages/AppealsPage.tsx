
import React, { useState, useMemo } from 'react';
import { UserProfile, Appeal } from '../../types';
import Modal from '../Modal';

interface AppealsPageProps {
  viewedUser: UserProfile;
  allUsers: UserProfile[];
  allAppeals: Appeal[];
  onCreateAppeals: (subject: string, recipientIds: number[]) => Promise<void>;
  onUpdateAppealStatus: (appealId: number, status: Appeal['status']) => Promise<void>;
  onDeleteAppeal: (appealId: number) => Promise<void>;
}

const getStatusColor = (status: Appeal['status']) => {
    switch (status) {
        case 'Pending Review': return 'bg-yellow-200 text-yellow-800';
        case 'In Progress': return 'bg-blue-200 text-blue-800';
        case 'Completed': return 'bg-green-200 text-green-800';
        default: return 'bg-gray-200 text-gray-800';
    }
};

const AppealsPage: React.FC<AppealsPageProps> = ({ viewedUser, allUsers, allAppeals, onCreateAppeals, onUpdateAppealStatus, onDeleteAppeal }) => {
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);

    const isAdmin = viewedUser.title.includes('(Admin)');

    const visibleAppeals = useMemo(() => {
        if (isAdmin) {
            return allAppeals;
        }
        return allAppeals.filter(appeal => appeal.recipientId === viewedUser.id);
    }, [allAppeals, viewedUser, isAdmin]);
    
    const handleRecipientToggle = (userId: number) => {
        setSelectedRecipients(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreateAppeals(subject, selectedRecipients);
        setCreateModalOpen(false);
        setSubject('');
        setSelectedRecipients([]);
    };

    const getUserNameById = (id: number) => {
        return allUsers.find(u => u.id === id)?.name || 'Unknown User';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-dark">Appeals & Memos</h2>
                {isAdmin && (
                    <button onClick={() => setCreateModalOpen(true)} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        Create New Appeal
                    </button>
                )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-brand-dark mb-4">
                    {isAdmin ? 'All Sent Appeals' : 'My Received Appeals'}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Subject</th>
                                {isAdmin && <th scope="col" className="px-6 py-3">Recipient</th>}
                                <th scope="col" className="px-6 py-3">Date Sent</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Sent By</th>
                                {isAdmin && <th scope="col" className="px-6 py-3">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleAppeals.map((appeal) => (
                                <tr key={appeal.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{appeal.subject}</td>
                                    {isAdmin && <td className="px-6 py-4 whitespace-nowrap">{getUserNameById(appeal.recipientId)}</td>}
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(appeal.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {isAdmin ? (
                                            <select
                                                value={appeal.status}
                                                onChange={(e) => onUpdateAppealStatus(appeal.id, e.target.value as Appeal['status'])}
                                                className={`text-xs font-semibold border-none rounded-md p-1 focus:ring-2 focus:ring-brand-accent ${getStatusColor(appeal.status)}`}
                                            >
                                                <option value="Pending Review">Pending Review</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(appeal.status)}`}>
                                                {appeal.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{appeal.assigned}</td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => onDeleteAppeal(appeal.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {visibleAppeals.length === 0 && <p className="text-center text-gray-500 py-4">No appeals found.</p>}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create and Send Appeal">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject / Message</label>
                            <textarea
                                id="subject"
                                rows={4}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"
                                placeholder="Enter the appeal message or memo..."
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Recipients</label>
                            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                                {allUsers.filter(u => !u.title.includes('(Admin)')).map(user => (
                                    <div key={user.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`recipient-${user.id}`}
                                            checked={selectedRecipients.includes(user.id)}
                                            onChange={() => handleRecipientToggle(user.id)}
                                            className="h-4 w-4 text-brand-accent focus:ring-brand-accent border-gray-300 rounded"
                                        />
                                        <label htmlFor={`recipient-${user.id}`} className="ml-3 block text-sm text-gray-900">
                                            {user.name} ({user.title})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right mt-6">
                        <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Send Appeal</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AppealsPage;

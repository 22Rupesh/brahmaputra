import React, { useState } from 'react';
import { UserProfile, Project, ActivityLogEntry } from '../../types';
import ManageUserModal from './admin/ManageUserModal';
import { supabase } from '../../lib/supabaseClient';
import { DEFAULT_AVATAR_URL } from '../../constants';


interface AdminPageProps {
    allUsers: UserProfile[];
    allProjects: Project[];
    refreshUsers: () => void;
    onAdminUpdateUser: (user: UserProfile) => void;
    onSaveProjectAssignments: (userId: number, assignments: Record<number, boolean>) => Promise<void>;
}

// Helper to generate random activity for the past year
const generateRandomActivity = (): ActivityLogEntry[] => {
    const activities: ActivityLogEntry[] = [];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        if (Math.random() > 0.7) { // 30% chance of activity
             activities.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 2) + 1,
            });
        }
    }
    return activities;
};

const AdminPage: React.FC<AdminPageProps> = ({ allUsers, allProjects, refreshUsers, onAdminUpdateUser, onSaveProjectAssignments }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [managingUser, setManagingUser] = useState<UserProfile | null>(null);

  const openModalForManage = (user: UserProfile) => {
    setManagingUser(user);
    setModalOpen(true);
  };
  
  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) {
        alert("Failed to delete user: " + error.message);
      } else {
        alert("User deleted successfully.");
        refreshUsers();
      }
    }
  };

  const handleAddNewUser = async () => {
      const newUser = {
        name: "New User",
        title: "Field Officer (User)",
        email: `new.user.${Date.now()}@example.com`,
        avatar_url: DEFAULT_AVATAR_URL,
        score: 83,
        activity_log: generateRandomActivity(),
        performance_data: [
            {"name": "Apr", "value": 60},
            {"name": "May", "value": 65},
            {"name": "Jun", "value": 70},
            {"name": "Jul", "value": 72},
            {"name": "Aug", "value": 78},
            {"name": "Sep", "value": 75}
        ],
        quantitative_kpis: [
            { "name": "File Disposal Rate", "target": "95%", "targetScore": "20", "actual": "90%", "weight": "20", "weightedScore": "19", "evidence": "eOffice_report_sept.pdf", "evidenceMeta": "3.2 MB" },
            { "name": "Site Visits Conducted", "target": "20", "targetScore": "15", "actual": "18", "weight": "15", "weightedScore": "14", "evidence": "tour_diary.docx", "evidenceMeta": "120 KB" },
            { "name": "Report Submissions", "target": "4", "targetScore": "15", "actual": "3", "weight": "15", "weightedScore": "11", "evidence": "monthly_reports.zip", "evidenceMeta": "15.7 MB" },
            { "name": "Audit Queries Resolved", "target": "10", "targetScore": "10", "actual": "10", "weight": "10", "weightedScore": "10", "evidence": "audit_log.xlsx", "evidenceMeta": "450 KB" },
            { "name": "Training Hours Completed", "target": "10", "targetScore": "10", "actual": "8", "weight": "10", "weightedScore": "8", "evidence": "iGOT_certificate.pdf", "evidenceMeta": "1.1 MB" }
        ],
        qualitative_kpis: [
            { "name": "Team Collaboration", "score": "Very Good", "scoreValue": "8", "weight": "10", "evidence": "Peer Review", "evidenceMeta": "Q3-2024" },
            { "name": "Innovation & Proactiveness", "score": "Good", "scoreValue": "7", "weight": "10", "evidence": "Manager Assessment" },
            { "name": "Adherence to Timelines", "score": "Average", "scoreValue": "6", "weight": "10", "evidence": "Project Logs" }
        ],
        division: 'Field Operations',
        region: 'North',
        tasks: [],
        badges: [],
        feedback: [],
      };

      const { error } = await supabase.from('profiles').insert([newUser]);
      if(error){
        alert("Failed to add user: " + error.message);
      } else {
        alert("A new user has been created. Click 'Manage' to edit their details.");
        refreshUsers();
      }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-dark">Admin - User Management</h2>
        <button onClick={handleAddNewUser} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
          Add New User
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Role / Title</th>
                <th className="px-6 py-3">Division</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center space-x-3">
                    <img src={DEFAULT_AVATAR_URL} alt={user.name} className="w-8 h-8 rounded-full bg-gray-200 p-0.5" />
                    <span>{user.name}</span>
                  </td>
                  <td className="px-6 py-4">{user.title}</td>
                  <td className="px-6 py-4">{user.division}</td>
                  <td className="px-6 py-4">{user.score}</td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    <button onClick={() => openModalForManage(user)} className="font-medium text-blue-600 hover:underline">Manage</button>
                    <button onClick={() => handleDelete(user.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {managingUser && (
        <ManageUserModal 
            isOpen={isModalOpen} 
            onClose={() => setModalOpen(false)} 
            user={managingUser}
            onSave={onAdminUpdateUser}
            allProjects={allProjects}
            onSaveProjectAssignments={onSaveProjectAssignments}
        />
      )}
    </div>
  );
};

export default AdminPage;

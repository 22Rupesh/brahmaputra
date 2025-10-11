import React, { useRef, useState } from 'react';
import { UserProfile } from '../../types';
import { DEFAULT_AVATAR_URL } from '../../constants';

interface SettingsPageProps {
  currentUser: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser }) => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoChangeClick = () => {
    photoInputRef.current?.click();
  };

  const onPhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      alert(`New photo selected: ${file.name}. In a real app, this would be uploaded to Supabase Storage and the URL would be updated.`);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateUser({ ...currentUser, name, title });
    setIsSaving(false);
  };
  
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password updated successfully! (This is a placeholder action)');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-brand-dark">Settings</h2>
      
      {/* Profile Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark border-b pb-2 mb-4">Profile Information</h3>
        <form className="space-y-4" onSubmit={handleProfileSave}>
          <input type="file" accept="image/*" ref={photoInputRef} onChange={onPhotoSelected} className="hidden" />
          <div className="flex items-center space-x-4">
            <img src={DEFAULT_AVATAR_URL} alt="avatar" className="w-20 h-20 rounded-full bg-gray-200 p-2" />
            <button type="button" onClick={handlePhotoChangeClick} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Change Photo</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
            </div>
          </div>
          <div className="text-right">
             <button type="submit" disabled={isSaving} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-400">
                {isSaving ? 'Saving...' : 'Save Profile'}
             </button>
          </div>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-brand-dark border-b pb-2 mb-4">Security</h3>
         <form className="space-y-4" onSubmit={handlePasswordUpdate}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input type="password" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-accent focus:border-brand-accent"/>
                </div>
            </div>
            <div className="text-right">
             <button type="submit" className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Update Password</button>
          </div>
         </form>
      </div>
    </div>
  );
};

export default SettingsPage;

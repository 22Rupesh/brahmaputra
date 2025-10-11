import React, { useMemo, useState, useEffect } from 'react';
import { UserProfile, AppraisalContent } from '../../types';
import { DEFAULT_AVATAR_URL } from '../../constants';

interface AppraisalPageProps {
  allUsers: UserProfile[];
  viewedUser: UserProfile;
  content: AppraisalContent | null;
  onUpdateContent: (newContent: Omit<AppraisalContent, 'id'>) => Promise<void>;
}

const AppraisalPage: React.FC<AppraisalPageProps> = ({ allUsers, viewedUser, content, onUpdateContent }) => {

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isEditingEvents, setIsEditingEvents] = useState(false);
  const [editedEvents, setEditedEvents] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (content) {
      setEditedMessage(content.message || '');
      setEditedEvents(content.events || []);
    }
  }, [content]);

  const isAdmin = viewedUser.title.includes('(Admin)');

  const topPerformers = useMemo(() => {
    return [...allUsers].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [allUsers]);

  const divisionPerformance = useMemo(() => {
    const divisions: { [key: string]: { totalScore: number, count: number } } = {};
    allUsers.forEach(user => {
      if (!divisions[user.division]) {
        divisions[user.division] = { totalScore: 0, count: 0 };
      }
      divisions[user.division].totalScore += user.score;
      divisions[user.division].count++;
    });

    return Object.entries(divisions)
      .map(([name, data]) => ({
        name,
        averageScore: Math.round(data.totalScore / data.count)
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [allUsers]);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-yellow-600';
    return 'text-brand-light';
  };
  
  const handleSaveMessage = async () => {
    if (content) {
      await onUpdateContent({ message: editedMessage, events: content.events });
      setIsEditingMessage(false);
    }
  };

  const handleSaveEvents = async () => {
    if (content) {
       // Filter out any empty event names before saving
      const validEvents = editedEvents.filter(event => event.name.trim() !== '');
      await onUpdateContent({ message: content.message, events: validEvents });
      setIsEditingEvents(false);
    }
  };

  const handleEventChange = (index: number, value: string) => {
    const newEvents = [...editedEvents];
    newEvents[index].name = value;
    setEditedEvents(newEvents);
  };
  
  const addEventField = () => {
    setEditedEvents([...editedEvents, { name: '' }]);
  };


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-brand-dark">Organizational Recognition & Appraisals</h2>
        <p className="text-brand-light mt-1">Celebrating excellence and tracking our collective progress.</p>
      </div>

      {/* Top Performers Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-brand-dark mb-4">🏆 Top Performers of the Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {topPerformers.map((user, index) => (
            <div key={user.id} className={`p-4 rounded-lg border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
              <div className="relative inline-block">
                <img src={DEFAULT_AVATAR_URL} alt={user.name} className="w-24 h-24 rounded-full mx-auto ring-4 ring-white bg-gray-200 p-2" />
                <span className={`absolute -top-2 -left-2 text-4xl ${getMedalColor(index)}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
              </div>
              <p className="font-bold text-lg mt-3 text-brand-dark">{user.name}</p>
              <p className="text-sm text-brand-light">{user.title}</p>
              <p className="mt-2 text-2xl font-bold text-brand-accent">{user.score} <span className="text-base font-normal">Points</span></p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Division Leaderboard */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-brand-dark mb-4">Division Leaderboard</h3>
          <ul className="space-y-3">
            {divisionPerformance.map((div, index) => (
              <li key={div.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <span className={`text-xl w-8 font-bold ${getMedalColor(index)}`}>{index + 1}.</span>
                  <p className="font-semibold text-brand-dark">{div.name}</p>
                </div>
                <p className="font-bold text-lg text-brand-accent">{div.averageScore}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Announcements */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-brand-dark">Announcements & Motivation</h3>
              {isAdmin && !isEditingMessage && !isEditingEvents && (
                  <button onClick={() => { setIsEditingMessage(true); setIsEditingEvents(true); }} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
              )}
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-brand-accent-light border-l-4 border-brand-accent">
              <h4 className="font-bold text-brand-dark">Message from the Board</h4>
              {isEditingMessage ? (
                <div>
                  <textarea 
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="w-full border p-2 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent mt-1"
                    rows={4}
                  />
                  <div className="text-right mt-2">
                    <button onClick={handleSaveMessage} className="bg-brand-accent text-white font-bold py-1 px-3 rounded text-sm">Save Message</button>
                    <button onClick={() => setIsEditingMessage(false)} className="ml-2 text-gray-600 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 mt-1">{content?.message}</p>
              )}
            </div>
            <div className="text-sm text-brand-light">
              <h4 className="font-semibold text-gray-700 mb-1">Upcoming Events:</h4>
              {isEditingEvents ? (
                <div className="space-y-2">
                  {editedEvents.map((event, index) => (
                    <input 
                      key={index}
                      type="text"
                      value={event.name}
                      onChange={(e) => handleEventChange(index, e.target.value)}
                      className="w-full border p-1.5 rounded-md shadow-sm text-gray-700 text-sm"
                    />
                  ))}
                  <button onClick={addEventField} className="text-blue-600 text-xs">+ Add Event</button>
                  <div className="text-right mt-2">
                    <button onClick={handleSaveEvents} className="bg-brand-accent text-white font-bold py-1 px-3 rounded text-sm">Save Events</button>
                     <button onClick={() => setIsEditingEvents(false)} className="ml-2 text-gray-600 text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <ul className="list-disc list-inside text-gray-700">
                  {content?.events.map((event, index) => <li key={index}>{event.name}</li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AppraisalPage;

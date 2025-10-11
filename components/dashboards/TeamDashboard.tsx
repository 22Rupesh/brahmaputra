import React, { useMemo } from 'react';
// @ts-ignore
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserProfile, Project, Task, ActivityLogEntry } from '../../types';
import StatCard from '../StatCard';
import ContributionGraph from '../ContributionGraph';


interface TeamDashboardProps {
    manager: UserProfile;
    teamMembers: UserProfile[];
    projects: Project[];
    allUsers: UserProfile[];
}

const getStatusColor = (status: string) => {
    if (status === 'On Time' || status === 'Completed') return 'bg-green-500';
    if (status === 'Slight Delay' || status === 'In Progress') return 'bg-yellow-500';
    if (status === 'Behind Schedule' || status === 'Pending' || status === 'Overdue') return 'bg-red-500';
    return 'bg-gray-500';
};

const TeamDashboard: React.FC<TeamDashboardProps> = ({ manager, teamMembers, projects }) => {
    
    const aggregatedActivity = useMemo(() => {
        const activityMap: { [date: string]: number } = {};
        const allTeam = [manager, ...teamMembers];
        allTeam.forEach(member => {
            (member.activityLog || []).forEach(log => {
                if (activityMap[log.date]) {
                    activityMap[log.date] += log.count;
                } else {
                    activityMap[log.date] = log.count;
                }
            });
        });

        return Object.entries(activityMap).map(([date, count]) => ({ date, count }));
    }, [manager, teamMembers]);

    const ProjectOverview = () => (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Project Overview Board</h3>
            <div className="space-y-4">
                {projects.map(p => (
                    <div key={p.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{p.name}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getStatusColor(p.status)}`}>{p.status}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">{p.progress}% Complete</p>
                                <p className="text-sm text-gray-500">{p.budgetUtilization}% Budget Used</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const TeamPerformance = () => {
        const teamTasks = teamMembers.flatMap(m => m.tasks || []);
        const workload = teamMembers.map(m => ({ name: m.name.split(' ')[0], tasks: (m.tasks || []).filter(t => t.status === 'Pending').length }));

        return (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark mb-4">Team Performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <StatCard title="Tasks Completed" value={teamTasks.filter(t => t.status === 'Completed').length} />
                    <StatCard title="Tasks Pending" value={teamTasks.filter(t => t.status === 'Pending').length} />
                    <StatCard title="Tasks Overdue" value={teamTasks.filter(t => t.status === 'Overdue').length} />
                </div>
                 <h4 className="font-semibold text-gray-700 mb-2">Workload Distribution (Pending Tasks)</h4>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workload} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#718096', fontSize: 12 }} width={60} />
                            <Tooltip />
                            <Bar dataKey="tasks" fill="#4a5568" name="Pending Tasks" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    const MilestoneTracker = () => (
         <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Milestone Tracking</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
            {projects.map(p => (
                <div key={p.id}>
                    <h4 className="font-semibold text-gray-700">{p.name}</h4>
                    <ul className="text-sm space-y-1 mt-1">
                        {(p.milestones || []).map(m => (
                            <li key={m.name} className="flex justify-between items-center">
                                <span>{m.name}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getStatusColor(m.status)}`}>{m.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            </div>
        </div>
    );
    
    const CommunicationHub = () => (
         <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Communication & Feedback Hub</h3>
            <div className="space-y-4">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
                    <p className="font-bold">AI Recommendation</p>
                    <p>Assign more manpower to 'Urban Drainage System' — 15% delay risk detected for next milestone.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-700">Issue Tracker</h4>
                    <p className="text-sm text-gray-600">3 Open Issues for 'Highway 37 Expansion' require your attention.</p>
                </div>
                 <button className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-teal-500 transition-colors">
                    View Project Comments
                </button>
            </div>
        </div>
    );


    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-brand-dark">Project Manager Dashboard: {manager.name}</h2>
                <p className="text-brand-light">Overseeing {teamMembers.length} team members and {projects.length} projects</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <ContributionGraph activityData={aggregatedActivity} title="Team Activity" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectOverview />
                <TeamPerformance />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MilestoneTracker />
                <CommunicationHub />
            </div>

        </div>
    );
};

export default TeamDashboard;
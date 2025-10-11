import React from 'react';
import { UserProfile, Project, KpiPolicy, Broadcast, AttendanceRecord, Alert } from '../types';
import IndividualDashboard from './dashboards/IndividualDashboard';
import TeamDashboard from './dashboards/TeamDashboard';
import OrganizationDashboard from './dashboards/OrganizationDashboard';

interface DashboardProps {
    currentUser: UserProfile;
    viewedUser: UserProfile;
    allUsers: UserProfile[];
    projects: Project[];
    allKpiPolicies: KpiPolicy[];
    allBroadcasts: Broadcast[];
    allAttendance: AttendanceRecord[];
    allAlerts: Alert[];
    onLogActivity: (activityType: 'siteVisit' | 'reportSubmission') => void;
    onUpdateKpiPolicies: (policies: KpiPolicy[]) => Promise<void>;
    onMarkAttendance: (coords: { latitude: number, longitude: number }) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { currentUser, viewedUser, allUsers, projects } = props;

    // Determine role and what to display
    const isViewingSelf = currentUser.id === viewedUser.id;
    const isManager = currentUser.title.includes('(Staff)') || currentUser.title.includes('(Admin)');
    const isAdmin = currentUser.title.includes('(Admin)');

    if (isViewingSelf) {
        if (isAdmin) {
            return <OrganizationDashboard allUsers={allUsers} projects={projects} allKpiPolicies={props.allKpiPolicies} onUpdateKpiPolicies={props.onUpdateKpiPolicies} />;
        }
        if (isManager) {
            const teamMembers = allUsers.filter(u => u.division === currentUser.division && u.id !== currentUser.id);
            const teamProjects = projects.filter(p => p.team.some(teamMemberId => teamMembers.map(tm => tm.id).includes(teamMemberId) || teamMemberId === currentUser.id));
            return <TeamDashboard manager={currentUser} teamMembers={teamMembers} projects={teamProjects} allUsers={allUsers} />;
        }
    }

    // Default to individual view for the viewedUser
    return <IndividualDashboard 
             viewedUser={viewedUser} 
             onLogActivity={props.onLogActivity} 
             allBroadcasts={props.allBroadcasts}
             allAttendance={props.allAttendance}
             onMarkAttendance={props.onMarkAttendance}
             allAlerts={props.allAlerts}
           />;
};

export default Dashboard;

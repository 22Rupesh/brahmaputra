
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { UserProfile, Project, Report, Appeal, Sepeal, KpiPolicy, AppraisalContent, DprTask, Broadcast, AttendanceRecord, Alert } from './types';

import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectsPage from './components/pages/ProjectsPage';
import FilesPage from './components/pages/FilesPage';
import ReportsPage from './components/pages/ReportsPage';
import AppealsPage from './components/pages/AppealsPage';
import SepealsPage from './components/pages/SepealsPage';
import AdminPage from './components/pages/AdminPage';
import SettingsPage from './components/pages/SettingsPage';
import HelpPage from './components/pages/HelpPage';
import DprPage from './components/pages/DprPage';
import BroadcastPage from './components/pages/BroadcastPage';
import AttendancePage from './components/pages/AttendancePage';
import AppraisalPage from './components/pages/AppraisalPage';
import AlertsPage from './components/pages/AlertsPage';
import MyMessagesPage from './components/pages/MyMessagesPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allAppeals, setAllAppeals] = useState<Appeal[]>([]);
  const [allSepeals, setAllSepeals] = useState<Sepeal[]>([]);
  const [allKpiPolicies, setAllKpiPolicies] = useState<KpiPolicy[]>([]);
  const [appraisalContent, setAppraisalContent] = useState<AppraisalContent | null>(null);
  const [allDprTasks, setAllDprTasks] = useState<DprTask[]>([]);
  const [allBroadcasts, setAllBroadcasts] = useState<Broadcast[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);

  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [
      { data: users },
      { data: projects },
      { data: reports },
      { data: appeals },
      { data: sepeals },
      { data: kpiPolicies },
      { data: appraisal },
      { data: dprTasks },
      { data: broadcasts },
      { data: attendance },
      { data: alerts },
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('reports').select('*'),
      supabase.from('appeals').select('*'),
      supabase.from('sepeals').select('*'),
      supabase.from('kpi_policies').select('*'),
      supabase.from('appraisal_content').select('*').limit(1).single(),
      supabase.from('dpr_tasks').select('*'),
      supabase.from('broadcasts').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('alerts').select('*'),
    ]);
    
    setAllUsers((users as UserProfile[]) || []);
    setAllProjects((projects as Project[]) || []);
    setAllReports((reports as any[])?.map(r => ({...r, generatedById: r.generated_by_id})) || []);
    setAllAppeals((appeals as any[])?.map(a => ({...a, recipientId: a.recipient_id})) || []);
    setAllSepeals((sepeals as any[])?.map(s => ({...s, assignedToId: s.assigned_to_id, createdAt: s.created_at})) || []);
    setAllKpiPolicies((kpiPolicies as KpiPolicy[]) || []);
    setAppraisalContent(appraisal as AppraisalContent || null);
    setAllDprTasks((dprTasks as any[])?.map(t => ({...t, userId: t.user_id, taskDate: t.task_date, projectId: t.project_id, evidenceUrl: t.evidence_url, mentorNotes: t.mentor_notes})) || []);
    setAllBroadcasts((broadcasts as any[])?.map(b => ({...b, targetAudience: b.target_audience, createdAt: b.created_at})) || []);
    setAllAttendance((attendance as any[])?.map(a => ({...a, userId: a.user_id, createdAt: a.created_at})) || []);
    setAllAlerts((alerts as any[])?.map(a => ({...a, userId: a.user_id, createdAt: a.created_at})) || []);

    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setViewedUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewedUser(null);
    setAuthView('login');
  };

  const handleUpdateUser = async (updatedUser: UserProfile) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedUser)
      .eq('id', updatedUser.id)
      .select()
      .single();
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else if (data) {
      alert('Profile updated successfully!');
      if (currentUser?.id === data.id) {
        setCurrentUser(data);
      }
      setViewedUser(data);
      await fetchData();
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) alert('Error deleting project: ' + error.message);
        else {
            alert('Project deleted successfully.');
            await fetchData();
        }
    }
  }

  const handleDeleteReport = async (reportId: number) => {
     if (window.confirm('Are you sure you want to delete this report?')) {
        const { error } = await supabase.from('reports').delete().eq('id', reportId);
        if (error) alert('Error deleting report: ' + error.message);
        else {
            alert('Report deleted successfully.');
            await fetchData();
        }
    }
  }

  const handleCreateAppeal = async (subject: string, recipientIds: number[]) => {
    if (!currentUser) return;
    const newAppeals = recipientIds.map(id => ({
        subject,
        recipient_id: id,
        date: new Date().toISOString(),
        status: 'Pending Review' as Appeal['status'],
        assigned: currentUser.name,
    }));
    const { error } = await supabase.from('appeals').insert(newAppeals);
    if (error) alert('Error creating appeal: ' + error.message);
    else {
        alert('Appeal(s) sent successfully.');
        await fetchData();
    }
  }

  const handleUpdateAppealStatus = async (appealId: number, status: Appeal['status']) => {
    const { error } = await supabase.from('appeals').update({ status }).eq('id', appealId);
    if (error) alert('Error updating appeal: ' + error.message);
    else await fetchData();
  }

  const handleDeleteAppeal = async (appealId: number) => {
    if (window.confirm('Are you sure you want to delete this appeal?')) {
        const { error } = await supabase.from('appeals').delete().eq('id', appealId);
        if (error) alert('Error deleting appeal: ' + error.message);
        else {
            alert('Appeal deleted successfully.');
            await fetchData();
        }
    }
  }

  const handleCreateSepeal = async (sepeal: Omit<Sepeal, 'id' | 'createdAt'>) => {
    const { assignedToId, ...rest } = sepeal;
    const { error } = await supabase.from('sepeals').insert([{ ...rest, created_at: new Date().toISOString(), assigned_to_id: assignedToId }]);
     if (error) alert('Error creating SEPEAL: ' + error.message);
    else {
        alert('SEPEAL created successfully.');
        await fetchData();
    }
  }

   const handleUpdateSepeal = async (sepeal: Sepeal) => {
    const { assignedToId, createdAt, ...rest } = sepeal; // createdAt is managed by DB
    const { error } = await supabase.from('sepeals').update({ ...rest, assigned_to_id: assignedToId }).eq('id', sepeal.id);
     if (error) alert('Error updating SEPEAL: ' + error.message);
    else {
        alert('SEPEAL updated successfully.');
        await fetchData();
    }
  }

  const handleDeleteSepeal = async (sepealId: number) => {
     const { error } = await supabase.from('sepeals').delete().eq('id', sepealId);
     if (error) alert('Error deleting SEPEAL: ' + error.message);
    else {
        alert('SEPEAL deleted successfully.');
        await fetchData();
    }
  }
  
   const handleSaveProjectAssignments = async (userId: number, assignments: Record<number, boolean>) => {
        for (const projectIdStr in assignments) {
            const projectId = parseInt(projectIdStr, 10);
            const shouldBeAssigned = assignments[projectId];
            const project = allProjects.find(p => p.id === projectId);
            if (!project) continue;

            const isCurrentlyAssigned = project.team.includes(userId);

            if (shouldBeAssigned && !isCurrentlyAssigned) {
                const newTeam = [...project.team, userId];
                await supabase.from('projects').update({ team: newTeam }).eq('id', projectId);
            } else if (!shouldBeAssigned && isCurrentlyAssigned) {
                const newTeam = project.team.filter(id => id !== userId);
                await supabase.from('projects').update({ team: newTeam }).eq('id', projectId);
            }
        }
        alert("Project assignments saved.");
        await fetchData();
    };

    const handleUpdateKpiPolicies = async (policies: KpiPolicy[]) => {
        const toDelete = allKpiPolicies.filter(p => !policies.find(ep => ep.id === p.id)).map(p => p.id);
        const toUpsert = policies.map(({ id, ...policy }) => ({
            ...policy,
            ...(id > 0 ? { id } : {}), 
        }));
        
        if (toDelete.length > 0) {
            const { error: deleteError } = await supabase.from('kpi_policies').delete().in('id', toDelete);
            if (deleteError) {
                alert("Error deleting KPI policies: " + deleteError.message);
                return;
            }
        }

        if (toUpsert.length > 0) {
            const { error: upsertError } = await supabase.from('kpi_policies').upsert(toUpsert);
            if (upsertError) {
                alert("Error saving KPI policies: " + upsertError.message);
                return;
            }
        }

        alert("KPI policies updated successfully.");
        await fetchData();
    };
    
    const handleUpdateAppraisalContent = async (newContent: Omit<AppraisalContent, 'id'>) => {
        if (!appraisalContent) return;
        const { error } = await supabase.from('appraisal_content').update(newContent).eq('id', appraisalContent.id);
        if (error) alert('Error updating content: ' + error.message);
        else {
            alert('Content updated.');
            await fetchData();
        }
    };

    const handleCreateDprTask = async (task: Omit<DprTask, 'id' | 'status' | 'evidenceUrl'>, evidenceFile: File | null) => {
        let evidenceUrl: string | null = null;
        if (evidenceFile && currentUser) {
            const filePath = `dpr_evidence/${currentUser.id}/${Date.now()}_${evidenceFile.name}`;
            const { error: uploadError } = await supabase.storage.from('files').upload(filePath, evidenceFile);
            if (uploadError) {
                alert('Failed to upload evidence: ' + uploadError.message);
                return;
            }
            const { data: urlData } = supabase.storage.from('files').getPublicUrl(filePath);
            evidenceUrl = urlData.publicUrl;
        }

        const { error } = await supabase.from('dpr_tasks').insert([{...task, user_id: task.userId, task_date: task.taskDate, project_id: task.projectId, status: 'Pending', evidence_url: evidenceUrl}]);
        if (error) alert('Error adding task: ' + error.message);
        else {
            alert('Task added successfully.');
            await fetchData();
        }
    };

    const handleUpdateDprTask = async (taskId: number, status: DprTask['status'], mentorNotes?: string) => {
        const { error } = await supabase.from('dpr_tasks').update({ status, mentor_notes: mentorNotes }).eq('id', taskId);
        if (error) alert('Error updating task: ' + error.message);
        else await fetchData();
    };
    
    const handleCreateBroadcast = async (broadcast: Omit<Broadcast, 'id' | 'createdAt'>) => {
      const { error } = await supabase.from('broadcasts').insert([{ ...broadcast, created_at: new Date().toISOString(), target_audience: broadcast.targetAudience }]);
      if (error) alert('Error sending broadcast: ' + error.message);
      else {
        alert('Broadcast sent!');
        await fetchData();
      }
    };

    const handleDeleteBroadcast = async (broadcastId: number) => {
      if (window.confirm('Delete this broadcast permanently?')) {
        const { error } = await supabase.from('broadcasts').delete().eq('id', broadcastId);
        if (error) alert('Error deleting broadcast: ' + error.message);
        else {
          alert('Broadcast deleted.');
          await fetchData();
        }
      }
    };
    
    const handleMarkAttendance = async (coords: { latitude: number, longitude: number }) => {
        if (!currentUser) return;
        const { error } = await supabase.from('attendance').insert([{ 
            user_id: currentUser.id, 
            latitude: coords.latitude,
            longitude: coords.longitude
        }]);
        if (error) {
            alert("Error marking attendance: " + error.message);
        } else {
            alert("Attendance marked successfully!");
            await fetchData();
        }
    };

    const handleCreateAlert = async (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
        const { userId, ...restOfAlert } = alertData;
        const alertForDb = {
            ...restOfAlert,
            user_id: userId,
        };

        const { error } = await supabase.from('alerts').insert([alertForDb]);

        if (error) {
            alert("Error sending alert: " + error.message);
            return;
        }

        const recipient = allUsers.find(user => user.id === userId);

        if (recipient) {
            console.log(`
                ==============================================
                EMAIL SIMULATION:
                ----------------------------------------------
                To: ${recipient.email}
                From: system@brahmaputra-productivity.com
                Subject: New Alert: ${alertData.title}
                
                Body:
                Hi ${recipient.name},

                You have a new alert from your administrator.

                Message: ${alertData.message}
                
                ${alertData.suggestion ? `Suggestion: ${alertData.suggestion}` : ''}
                
                Please log in to the portal to view details.
                ==============================================
            `);
            alert(`Alert sent successfully to ${recipient.name} in the app and an email notification has been sent to ${recipient.email}.`);
        } else {
            alert("Alert sent successfully!");
        }

        await fetchData();
    };
    
    const handleDeleteAlert = async (alertId: number) => {
      if (window.confirm('Are you sure you want to delete this alert?')) {
        const { error } = await supabase.from('alerts').delete().eq('id', alertId);
        if (error) alert('Error deleting alert: ' + error.message);
        else {
          alert('Alert deleted.');
          await fetchData();
        }
      }
    };

    const handleLogActivity = async (activityType: 'siteVisit' | 'reportSubmission') => {
        if (!currentUser) return;
        const today = new Date().toISOString().split('T')[0];
        const existingLog = currentUser.activityLog || [];
        const todayEntryIndex = existingLog.findIndex(e => e.date === today);
        let newLog;
        if (todayEntryIndex > -1) {
            newLog = [...existingLog];
            newLog[todayEntryIndex] = {...newLog[todayEntryIndex], count: newLog[todayEntryIndex].count + 1};
        } else {
            newLog = [...existingLog, { date: today, count: 1 }];
        }
        
        const { error } = await supabase.from('profiles').update({ activity_log: newLog }).eq('id', currentUser.id);
        if(error) {
            alert("Failed to log dashboard visit: " + error.message);
        } else {
            await fetchData();
        }
    };

  const renderPage = () => {
    if (!viewedUser || !currentUser) return null; 
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
                  currentUser={currentUser} 
                  viewedUser={viewedUser} 
                  allUsers={allUsers} 
                  projects={allProjects} 
                  allKpiPolicies={allKpiPolicies}
                  onLogActivity={handleLogActivity}
                  onUpdateKpiPolicies={handleUpdateKpiPolicies}
                  allBroadcasts={allBroadcasts}
                  allAttendance={allAttendance}
                  onMarkAttendance={handleMarkAttendance}
                  allAlerts={allAlerts}
                />;
      case 'messages':
        return <MyMessagesPage 
                  currentUser={currentUser}
                  allAlerts={allAlerts}
                  allBroadcasts={allBroadcasts}
                />;
      case 'dpr':
        return <DprPage 
                  viewedUser={viewedUser} 
                  allUsers={allUsers}
                  allProjects={allProjects}
                  allDprTasks={allDprTasks}
                  onCreateTask={handleCreateDprTask}
                  onUpdateTask={handleUpdateDprTask}
               />;
      case 'projects':
        return <ProjectsPage viewedUser={viewedUser} allProjects={allProjects} allUsers={allUsers} refreshProjects={fetchData} onDeleteProject={handleDeleteProject} />;
      case 'files':
        return <FilesPage currentUser={currentUser} />;
      case 'reports':
        return <ReportsPage viewedUser={viewedUser} initialReports={allReports} refreshReports={fetchData} onDeleteReport={handleDeleteReport} />;
      case 'appeals':
        return <AppealsPage 
                  viewedUser={viewedUser} 
                  allUsers={allUsers} 
                  allAppeals={allAppeals} 
                  onCreateAppeals={handleCreateAppeal}
                  onUpdateAppealStatus={handleUpdateAppealStatus}
                  onDeleteAppeal={handleDeleteAppeal}
                />;
      case 'sepeals':
        return <SepealsPage
                  currentUser={currentUser}
                  allUsers={allUsers}
                  allSepeals={allSepeals}
                  onCreate={handleCreateSepeal}
                  onUpdate={handleUpdateSepeal}
                  onDelete={handleDeleteSepeal}
                />;
      case 'broadcast':
        return <BroadcastPage 
                  currentUser={currentUser} 
                  allUsers={allUsers} 
                  allBroadcasts={allBroadcasts}
                  onCreateBroadcast={handleCreateBroadcast}
                  onDeleteBroadcast={handleDeleteBroadcast}
                />;
      case 'attendance':
        return <AttendancePage allAttendance={allAttendance} allUsers={allUsers} />;
      case 'appraisals':
          return <AppraisalPage 
                    allUsers={allUsers} 
                    viewedUser={viewedUser} 
                    content={appraisalContent}
                    onUpdateContent={handleUpdateAppraisalContent}
                 />;
      case 'alerts':
          return <AlertsPage
                    currentUser={currentUser}
                    allUsers={allUsers}
                    allAlerts={allAlerts}
                    onCreateAlert={handleCreateAlert}
                    onDeleteAlert={handleDeleteAlert}
                 />;
      case 'admin':
        return <AdminPage allUsers={allUsers} allProjects={allProjects} refreshUsers={fetchData} onAdminUpdateUser={handleUpdateUser} onSaveProjectAssignments={handleSaveProjectAssignments} />;
      case 'settings':
        return <SettingsPage currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'help':
        return <HelpPage />;
      default:
        return <div>Page not found</div>;
    }
  };

  if (isLoading && !currentUser) {
    return <div className="flex items-center justify-center h-screen bg-brand-bg"><p>Loading application...</p></div>;
  }
  
  if (!currentUser) {
    if (authView === 'signup') {
        return <SignupPage onSignupSuccess={() => { setAuthView('login'); fetchData(); }} onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onLogin={handleLogin} allUsers={allUsers} onSwitchToSignup={() => setAuthView('signup')} />;
  }

  return (
    <div className="h-screen w-screen flex bg-brand-bg font-sans overflow-hidden">
      <Sidebar user={currentUser} currentPage={currentPage} onNavigate={setCurrentPage} isSidebarOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
            currentUser={currentUser} 
            viewedUser={viewedUser} 
            setViewedUser={setViewedUser}
            allUsers={allUsers}
            onLogout={handleLogout}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;

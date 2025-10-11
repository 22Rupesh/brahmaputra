import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_AVATAR_URL } from '../constants';

interface SignupPageProps {
    onSignupSuccess: () => void;
    onSwitchToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('Field Officer (User)');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const newUser = {
            name,
            email,
            title,
            avatar_url: DEFAULT_AVATAR_URL,
            score: 83,
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

        setLoading(false);
        if (error) {
            alert("Error signing up: " + error.message);
        } else {
            alert("Signup successful! Please log in.");
            onSignupSuccess();
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-brand-bg">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-dark">Create Account</h1>
                    <p className="mt-2 text-brand-light">Join the Productivity Suite</p>
                </div>
                <form className="space-y-6" onSubmit={handleSignup}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
                        />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                           Role / Title
                        </label>
                        <select
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
                        >
                           <option>Field Officer (User)</option>
                           <option>Project Manager (Staff)</option>
                           <option>Administrator (Admin)</option>
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-accent hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button onClick={onSwitchToLogin} className="font-medium text-brand-accent hover:underline focus:outline-none">
                    Log In
                  </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;

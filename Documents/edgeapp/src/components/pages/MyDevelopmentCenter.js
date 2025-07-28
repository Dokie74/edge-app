// V3.7 STEP 3: My Development Center - Replace src/components/pages/Settings.js
// Transform Settings into a comprehensive employee development platform

import React, { useState, useEffect } from 'react';
import { Target, BookOpen, MessageSquare, User, Plus, Calendar, AlertTriangle, Info } from 'lucide-react';

const MyDevelopmentCenter = () => {
    const [activeTab, setActiveTab] = useState('goals');
    const [profile, setProfile] = useState(null);
    const [developmentGoals, setDevelopmentGoals] = useState([]);
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showGuidance, setShowGuidance] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchProfile(),
                fetchDevelopmentGoals(),
                fetchTrainingRequests()
            ]);
        } catch (error) {
            console.error('Error fetching development data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            // Mock profile data for now
            setProfile({ name: 'Employee', job_title: 'Software Developer', department: 'Engineering' });
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchDevelopmentGoals = async () => {
        try {
            // Mock development goals for now
            setDevelopmentGoals([]);
        } catch (error) {
            console.error('Error fetching development goals:', error);
        }
    };

    const fetchTrainingRequests = async () => {
        try {
            // Mock training requests for now
            setTrainingRequests([]);
        } catch (error) {
            console.error('Error fetching training requests:', error);
        }
    };

    const tabs = [
        { 
            id: 'profile', 
            name: 'My Profile', 
            icon: User,
            description: 'View your current role and information'
        },
        { 
            id: 'goals', 
            name: 'Development Goals', 
            icon: Target,
            description: 'Set and track your career growth objectives'
        },
        { 
            id: 'training', 
            name: 'Training Requests', 
            icon: BookOpen,
            description: 'Request courses, certifications, and learning opportunities'
        },
        { 
            id: 'communication', 
            name: 'Manager Communication', 
            icon: MessageSquare,
            description: 'Direct messaging with your manager about development'
        }
    ];

    // Check if user is new (no goals, no training requests)
    const isNewUser = developmentGoals.length === 0 && trainingRequests.length === 0;

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="text-yellow-400 text-lg">Loading your development center...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white">My Development Center</h1>
                <p className="text-gray-400 mt-2">Take ownership of your career growth and professional development.</p>
                
                {/* Welcome guidance for new users */}
                {showGuidance && isNewUser && (
                    <div className="mt-6 bg-gradient-to-r from-cyan-900 to-blue-900 rounded-lg p-6 border border-cyan-700">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <Info className="text-cyan-400 mt-1" size={20} />
                                <div>
                                    <h3 className="text-cyan-200 font-semibold text-lg mb-2">Welcome to Your Development Center</h3>
                                    <div className="text-cyan-300 text-sm space-y-2">
                                        <p><strong>Purpose:</strong> This is your personal space to actively manage your career growth, set learning goals, and communicate development needs with your manager.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            <div className="space-y-2">
                                                <p className="font-medium">What you can do:</p>
                                                <ul className="text-xs space-y-1 ml-4">
                                                    <li>• Set career aspirations and skill development goals</li>
                                                    <li>• Request training, courses, and certifications</li>
                                                    <li>• Communicate directly with your manager about growth</li>
                                                    <li>• Track your professional development progress</li>
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-medium">Expected outcomes:</p>
                                                <ul className="text-xs space-y-1 ml-4">
                                                    <li>• Clear career development roadmap</li>
                                                    <li>• Regular learning opportunities</li>
                                                    <li>• Better manager-employee development conversations</li>
                                                    <li>• Enhanced skills and career advancement</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-3 bg-cyan-800 rounded border border-cyan-600">
                                            <p className="font-medium flex items-center">
                                                <Target size={16} className="mr-2" />
                                                Get started: Add your first development goal or request training to begin your journey.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowGuidance(false)}
                                className="text-cyan-400 hover:text-cyan-300 ml-4"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Tab Navigation */}
            <div className="mb-8">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center group relative ${
                                        activeTab === tab.id
                                            ? 'border-cyan-500 text-cyan-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                    }`}
                                    title={tab.description}
                                >
                                    <Icon size={16} className="mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                
                {/* Active Tab Description */}
                <div className="mt-2 text-gray-400 text-sm">
                    {tabs.find(tab => tab.id === activeTab)?.description}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && <ProfileSection profile={profile} />}
            {activeTab === 'goals' && (
                <GoalsSection 
                    goals={developmentGoals}
                    onRefresh={fetchDevelopmentGoals}
                />
            )}
            {activeTab === 'training' && (
                <TrainingSection 
                    requests={trainingRequests}
                    onRefresh={fetchTrainingRequests}
                />
            )}
            {activeTab === 'communication' && <CommunicationSection />}
        </div>
    );
};

// Profile Section Component
const ProfileSection = ({ profile }) => (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">My Profile</h2>
        
        {profile ? (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <div className="p-3 bg-gray-700 rounded-md text-white">{profile.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <div className="p-3 bg-gray-700 rounded-md text-white">{profile.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                        <div className="p-3 bg-gray-700 rounded-md text-white">{profile.job_title || 'Not specified'}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Manager</label>
                        <div className="p-3 bg-gray-700 rounded-md text-white">{profile.manager_name || 'No manager assigned'}</div>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-900 rounded-lg border border-blue-700">
                    <h4 className="text-blue-200 font-semibold mb-2">Note:</h4>
                    <p className="text-blue-300 text-sm">
                        Profile information is managed by your administrator. If you need to update your role or manager assignment, 
                        please contact HR or your system administrator.
                    </p>
                </div>
            </div>
        ) : (
            <div className="text-center py-8">
                <User size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">Profile information not available.</p>
            </div>
        )}
    </div>
);

// Goals Section Component - Simplified for V3.7
const GoalsSection = ({ goals, onRefresh }) => (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">My Development Goals</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Set specific, measurable goals for your professional growth
                </p>
            </div>
            <button
                onClick={() => alert('Goal creation coming in next update!')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
                <Plus size={18} className="mr-2" />
                Add Goal
            </button>
        </div>

        {goals.length === 0 ? (
            <div className="text-center py-12">
                <Target size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-white text-lg mb-2">No development goals yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Development goals help you focus your learning and career growth. 
                    Start by setting 1-3 specific goals for the next quarter.
                </p>
                <button
                    onClick={() => alert('Goal creation coming in next update!')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                    Set My First Goal
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {goals.map(goal => (
                    <div key={goal.goal_id} className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                        <p className="text-gray-400 capitalize">{goal.goal_type.replace('_', ' ')}</p>
                        {goal.description && <p className="text-gray-300 mt-2">{goal.description}</p>}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Training Section Component - Simplified for V3.7
const TrainingSection = ({ requests, onRefresh }) => (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-white">Training Requests</h2>
                <p className="text-gray-400 text-sm mt-1">
                    Request courses, certifications, and learning opportunities
                </p>
            </div>
            <button
                onClick={() => alert('Training request form coming in next update!')}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
            >
                <Plus size={18} className="mr-2" />
                Request Training
            </button>
        </div>

        {requests.length === 0 ? (
            <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-white text-lg mb-2">No training requests yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Request training to advance your skills and career. Include business justification 
                    to help your manager understand the value and approve your request.
                </p>
                <button
                    onClick={() => alert('Training request form coming in next update!')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                    Request My First Training
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {requests.map(request => (
                    <div key={request.request_id} className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                        <p className="text-gray-400 capitalize">{request.request_type.replace('_', ' ')}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">
                            {request.status}
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// Communication Section Component - Placeholder for V3.7
const CommunicationSection = () => (
    <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Manager Communication</h2>
        <div className="text-center py-12">
            <MessageSquare size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">Communication system coming soon</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Direct messaging with your manager about development topics will be available in the next update.
            </p>
            <div className="bg-purple-900 rounded-lg p-4 text-left max-w-lg mx-auto">
                <h4 className="text-purple-200 font-semibold mb-2">Preview - Coming features:</h4>
                <ul className="text-purple-300 text-sm space-y-1">
                    <li>• Direct messaging with your manager</li>
                    <li>• Development topic discussions</li>
                    <li>• Goal and training conversations</li>
                    <li>• Career planning dialogues</li>
                </ul>
            </div>
        </div>
    </div>
);

export default MyDevelopmentCenter;
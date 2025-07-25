// src/components/pages/Dashboard.js - Enhanced V2.5
import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Award, TrendingUp, MessageSquare } from 'lucide-react';

const Dashboard = ({ supabase, setActivePage, openModal }) => {
    const [assessments, setAssessments] = useState([]);
    const [kudos, setKudos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchMyAssessments(),
                fetchKudos()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAssessments = async () => {
        try {
            const { data, error } = await supabase.rpc('get_my_assessments');
            if (error) throw error;
            setAssessments(data || []);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const fetchKudos = async () => {
        try {
            const { data, error } = await supabase.rpc('get_kudos_wall');
            if (error) throw error;
            setKudos(data || []);
        } catch (error) {
            console.error('Error fetching kudos:', error);
        }
    };

    const getStatusDisplay = (assessment) => {
        const currentStatus = assessment.self_assessment_status || assessment.status;
        
        const statusMap = {
            'not_started': { 
                label: 'Not Started', 
                color: 'text-gray-400',
                bgColor: 'bg-gray-600',
                actionLabel: 'Start'
            },
            'in_progress': { 
                label: 'In Progress', 
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-600',
                actionLabel: 'Continue'
            },
            'employee_complete': { 
                label: 'Self-Assessment Complete', 
                color: 'text-blue-400',
                bgColor: 'bg-blue-600',
                actionLabel: 'View'
            },
            'manager_complete': { 
                label: 'Manager Review Complete', 
                color: 'text-purple-400',
                bgColor: 'bg-purple-600',
                actionLabel: 'View'
            },
            'finalized': { 
                label: 'Finalized', 
                color: 'text-green-400',
                bgColor: 'bg-green-600',
                actionLabel: 'View'
            }
        };
        
        return statusMap[currentStatus] || { 
            label: 'No Status', 
            color: 'text-gray-400',
            bgColor: 'bg-gray-600',
            actionLabel: 'View'
        };
    };

    const isActiveReview = (assessment) => {
        const currentStatus = assessment.self_assessment_status || assessment.status;
        return currentStatus !== 'finalized';
    };

    const handleViewAssessment = (assessment) => {
        setActivePage({
            name: 'Assessment',
            props: { assessmentId: assessment.assessment_id }
        });
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="text-yellow-400 text-lg">Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-center py-12">
                    <div className="text-red-400 text-lg">Error: {error}</div>
                </div>
            </div>
        );
    }

    const activeReviews = assessments.filter(assessment => isActiveReview(assessment));
    const completedReviews = assessments.filter(assessment => !isActiveReview(assessment));
    const recentKudos = kudos.slice(0, 5);

    return (
        <div className="p-8">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 mt-2">
                    Welcome back! Here's your summary.
                </p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Active Reviews</p>
                            <p className="text-2xl font-bold text-cyan-400">{activeReviews.length}</p>
                        </div>
                        <Calendar className="text-cyan-400" size={24} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Total Reviews</p>
                            <p className="text-2xl font-bold text-green-400">{assessments.length}</p>
                        </div>
                        <CheckCircle className="text-green-400" size={24} />
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm">Recent Kudos</p>
                            <p className="text-2xl font-bold text-purple-400">{recentKudos.length}</p>
                        </div>
                        <Award className="text-purple-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Active Reviews */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                    <h2 className="text-2xl font-semibold mb-6 text-cyan-400 flex items-center">
                        <Calendar className="mr-3" size={24} />
                        Active Reviews
                    </h2>
                    <div className="space-y-4">
                        {activeReviews.length > 0 ? (
                            activeReviews.map(assessment => {
                                const statusInfo = getStatusDisplay(assessment);
                                
                                return (
                                    <div key={assessment.assessment_id} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{assessment.cycle_name}</h3>
                                                <div className="flex items-center mt-1">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} text-white`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleViewAssessment(assessment)}
                                                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition"
                                            >
                                                {statusInfo.actionLabel}
                                            </button>
                                        </div>
                                        
                                        {/* Progress indicator */}
                                        {assessment.self_assessment_status === 'in_progress' && (
                                            <div className="mt-3 p-2 bg-yellow-900 rounded text-yellow-200 text-sm">
                                                <Clock size={14} className="inline mr-1" />
                                                Continue your self-assessment
                                            </div>
                                        )}
                                        
                                        {assessment.self_assessment_status === 'employee_complete' && (
                                            <div className="mt-3 p-2 bg-blue-900 rounded text-blue-200 text-sm">
                                                <CheckCircle size={14} className="inline mr-1" />
                                                Submitted for manager review
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
                                <p>No active reviews at this time.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kudos Wall */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-yellow-400 flex items-center">
                            <Award className="mr-3" size={24} />
                            Kudos Wall
                        </h2>
                        {openModal && (
                            <button
                                onClick={() => openModal('giveKudo')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition text-sm"
                            >
                                Give Kudos
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {recentKudos.length > 0 ? (
                            recentKudos.map(kudo => (
                                <div key={kudo.kudo_id} className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <Award size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-white font-medium">{kudo.recipient_name}</span>
                                                <span className="text-gray-400 text-sm">received kudos for</span>
                                                <span className="px-2 py-1 bg-cyan-600 text-cyan-100 text-xs rounded">
                                                    {kudo.core_value}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{kudo.message}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-gray-500 text-xs">from {kudo.giver_name}</span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(kudo.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Award size={48} className="mx-auto mb-4 text-gray-600" />
                                <p className="mb-2">No kudos yet!</p>
                                <p className="text-xs">Be the first to recognize someone's great work.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
                <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
                    <TrendingUp className="mr-3" size={24} />
                    Quick Actions
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setActivePage({ name: 'My Reviews' })}
                        className="bg-blue-700 hover:bg-blue-600 text-left p-4 rounded-lg transition group"
                    >
                        <div className="flex items-center">
                            <Calendar size={20} className="text-blue-400 mr-3" />
                            <div>
                                <p className="text-white font-medium">View All Reviews</p>
                                <p className="text-blue-300 text-sm">See your review history</p>
                            </div>
                        </div>
                    </button>

                    {openModal && (
                        <button
                            onClick={() => openModal('giveKudo')}
                            className="bg-yellow-700 hover:bg-yellow-600 text-left p-4 rounded-lg transition group"
                        >
                            <div className="flex items-center">
                                <Award size={20} className="text-yellow-400 mr-3" />
                                <div>
                                    <p className="text-white font-medium">Give Kudos</p>
                                    <p className="text-yellow-300 text-sm">Recognize a colleague's great work</p>
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
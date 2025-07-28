// STEP 5: Enhanced MyReviews Page - Replace src/components/pages/MyReviews.js
// This shows better status information like V4 had

import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Award, ArrowRight, Filter } from 'lucide-react';
import { useAssessments } from '../../hooks';
import { useApp } from '../../contexts';
import { getStatusDisplay, filterActiveReviews, filterCompletedReviews, formatDate } from '../../utils';

export default function MyReviews() {
  const { setActivePage } = useApp();
  const { assessments: reviews, loading, error, refresh } = useAssessments();
  const [filter, setFilter] = useState('all'); // all, active, completed

  const getStatusInfo = (review) => {
    return getStatusDisplay(review);
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'active') return filterActiveReviews([review]).length > 0;
    if (filter === 'completed') return filterCompletedReviews([review]).length > 0;
    return true;
  });

  const activeCount = filterActiveReviews(reviews).length;
  const completedCount = filterCompletedReviews(reviews).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-yellow-400 text-lg">Loading your reviews...</div>
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

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white">My Review History</h1>
        <p className="text-gray-400 mt-2">Access your current and past performance reviews.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-cyan-400">{reviews.length}</p>
            </div>
            <Calendar className="text-cyan-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Reviews</p>
              <p className="text-2xl font-bold text-yellow-400">{activeCount}</p>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', name: 'All Reviews', count: reviews.length },
              { id: 'active', name: 'Active', count: activeCount },
              { id: 'completed', name: 'Completed', count: completedCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  filter === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Filter size={16} className="mr-2" />
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map(review => {
              const statusInfo = getStatusInfo(review);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={review.assessment_id} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{review.cycle_name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} text-white flex items-center`}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Created: {new Date(review.created_at).toLocaleDateString()}</p>
                        
                        {/* Show action needed for active reviews */}
                        {statusInfo.isActive && (
                          <p className={`font-medium ${statusInfo.color}`}>
                            {review.self_assessment_status === 'not_started' && 'Action needed: Start your self-assessment'}
                            {review.self_assessment_status === 'in_progress' && 'Action needed: Complete your self-assessment'}
                            {review.self_assessment_status === 'employee_complete' && review.manager_review_status === 'pending' && 'Waiting for manager review'}
                            {review.self_assessment_status === 'employee_complete' && review.manager_review_status === 'completed' && !review.employee_acknowledgment && 'Manager review complete - please acknowledge'}
                            {review.self_assessment_status === 'employee_complete' && review.manager_review_status === 'completed' && review.employee_acknowledgment && 'Review process complete'}
                            {review.self_assessment_status === 'manager_complete' && 'Review complete - view feedback'}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setActivePage({
                        name: 'Assessment',
                        props: { assessmentId: review.assessment_id }
                      })}
                      className="flex items-center text-cyan-400 hover:text-cyan-300 transition"
                    >
                      View Details 
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">
              {filter === 'all' ? 'No reviews found' : 
               filter === 'active' ? 'No active reviews' : 'No completed reviews'}
            </h3>
            <p className="text-gray-400">
              {filter === 'all' ? 'Your review history will appear here once cycles are created.' :
               filter === 'active' ? 'No reviews are currently in progress.' : 
               'Completed reviews will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
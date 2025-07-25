// src/components/pages/MyTeam.js - Enhanced with Error Handling
import React, { useEffect, useState } from 'react';
import { Play, Users, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';

export default function MyTeam({ supabase, openModal, setActivePage }) {
  const [teamStatus, setTeamStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 MyTeam: Fetching team status...');
      
      const { data, error } = await supabase.rpc('get_team_status');
      
      if (error) {
        console.error('❌ Team status error:', error);
        throw error;
      }
      
      console.log('✅ Team status loaded:', data);
      setTeamStatus(data || []);
      
    } catch (err) {
      console.error('💥 MyTeam fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Team</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading your team...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Team</h1>
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <div className="flex items-center text-red-200 mb-4">
            <AlertTriangle size={20} className="mr-2" />
            <span className="font-semibold">Error Loading Team</span>
          </div>
          <p className="text-red-300 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-200">
            <p><strong>Possible causes:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>You might not be set up as a manager in the system</li>
              <li>The get_team_status function might be missing</li>
              <li>Database permissions issue</li>
            </ul>
          </div>
          <button
            onClick={load}
            className="mt-4 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">My Team</h1>
          <p className="text-gray-400 mt-2">Manage your direct reports and their assessments</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={load}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          {openModal && (
            <button
              onClick={() => openModal('startReviewCycle', { afterSave: load })}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Play size={16} className="mr-2" />
              Start Review Cycle
            </button>
          )}
        </div>
      </div>

      {/* Team Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-cyan-400">{teamStatus.length}</p>
            </div>
            <Users className="text-cyan-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Assessments</p>
              <p className="text-2xl font-bold text-green-400">
                {teamStatus.filter(member => member.assessment_id).length}
              </p>
            </div>
            <Calendar className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {teamStatus.length > 0 
                  ? Math.round((teamStatus.filter(m => m.assessment_status === 'completed').length / teamStatus.length) * 100)
                  : 0}%
              </p>
            </div>
            <AlertTriangle className="text-purple-400" size={24} />
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Team Members</h2>
        
        {teamStatus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Job Title</th>
                  <th className="px-4 py-3 text-left">Assessment Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamStatus.map((member) => (
                  <tr key={member.employee_id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{member.employee_name}</p>
                        <p className="text-xs text-gray-400">ID: {member.employee_id.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {member.job_title || 'No Title'}
                    </td>
                    <td className="px-4 py-3">
                      {member.assessment_status ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.assessment_status === 'completed' ? 'bg-green-600 text-green-100' :
                          member.assessment_status === 'in_progress' ? 'bg-yellow-600 text-yellow-100' :
                          'bg-gray-600 text-gray-100'
                        }`}>
                          {member.assessment_status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-500">No Assessment</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.assessment_id ? (
                        <button
                          onClick={() => setActivePage({ 
                            name: 'Assessment', 
                            props: { assessmentId: member.assessment_id } 
                          })}
                          className="text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          View Assessment
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-white text-lg mb-2">No Team Members Found</h3>
            <div className="text-gray-400 space-y-1">
              <p>This could mean:</p>
              <ul className="text-sm text-gray-500 mt-2">
                <li>• You don't have any direct reports assigned</li>
                <li>• You're not set up as a manager in the system</li>
                <li>• No active review cycles have been started</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
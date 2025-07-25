// src/components/pages/Admin.js - SIMPLIFIED VERSION FOR TESTING
import React, { useEffect, useState } from 'react';
import { Users, Calendar, Plus, Play, AlertTriangle } from 'lucide-react';

export default function Admin({ supabase }) {
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔄 Admin: Fetching data...');
    
    // Use the standard get_all_employees function (should work with SECURITY DEFINER)
    try {
      const { data: employeesData, error: employeesError } = await supabase.rpc('get_all_employees');
      
      if (employeesError) {
        console.error('⚠️ Employees RPC error:', employeesError);
        throw employeesError;
      } else {
        console.log('✅ Employees loaded via standard RPC:', employeesData);
        setEmployees(employeesData || []);
      }
    } catch (employeeError) {
      console.error('💥 Employee fetch failed:', employeeError);
      setError(`Employee fetch failed: ${employeeError.message}`);
      setEmployees([]);
    }

    // Fetch review cycles (this should work)
    try {
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('review_cycles')
        .select('id, name, status, start_date, end_date, created_at')
        .order('created_at', { ascending: false });
      
      if (cyclesError) {
        console.error('⚠️ Cycles error:', cyclesError);
        setCycles([]);
      } else {
        console.log('✅ Cycles loaded:', cyclesData);
        setCycles(cyclesData || []);
      }
    } catch (cycleError) {
      console.error('💥 Cycles fetch failed:', cycleError);
      setCycles([]);
    }

  } catch (err) {
    console.error('💥 Admin fetch error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleActivateCycle = async (cycleId) => {
    try {
      const { data, error } = await supabase.rpc('activate_review_cycle', {
        p_cycle_id: cycleId
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        alert('✅ ' + data.message);
        fetchData(); // Refresh data
      } else {
        alert('⚠️ ' + (data?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">Admin Panel</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading admin data...</div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const colors = {
      upcoming: 'bg-yellow-600 text-white',
      active: 'bg-green-600 text-white', 
      completed: 'bg-blue-600 text-white'
    };
    return colors[status] || 'bg-gray-600 text-white';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">Admin Panel</h1>
          <p className="text-gray-400 mt-2">Manage employees and review cycles</p>
          <p className="text-xs text-yellow-400 mt-1">Simplified version for testing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Create Review Cycle
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <div className="flex items-center text-red-200">
            <AlertTriangle size={16} className="mr-2" />
            <span>Error: {error}</span>
          </div>
          <button 
            onClick={fetchData}
            className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-red-100 text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employees Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="mr-2 text-cyan-400" size={24} />
              <h2 className="text-xl font-semibold">Employees ({employees.length})</h2>
            </div>
            <button 
              onClick={fetchData}
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Refresh
            </button>
          </div>
          
          {employees.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employees.map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-white">{employee.name}</p>
                    <p className="text-sm text-gray-400">{employee.email}</p>
                    <p className="text-xs text-gray-500">
                      {employee.job_title || 'No Title'} • 
                      {employee.manager_id ? ' Has Manager' : ' No Manager'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded bg-green-600 text-white">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              {error ? (
                <div className="text-red-400">
                  <AlertTriangle size={48} className="mx-auto mb-4" />
                  <p>Failed to load employees</p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <Users size={48} className="mx-auto mb-4" />
                  <p>No employees found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Cycles Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 text-cyan-400" size={24} />
              <h2 className="text-xl font-semibold">Review Cycles ({cycles.length})</h2>
            </div>
          </div>
          
          {cycles.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-white">{cycle.name}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(cycle.status)}`}>
                      {cycle.status}
                    </span>
                  </div>
                  
                  {cycle.status === 'upcoming' && (
                    <button
                      onClick={() => handleActivateCycle(cycle.id)}
                      className="text-green-400 hover:text-green-300 flex items-center text-sm mt-2"
                    >
                      <Play size={14} className="mr-1" />
                      Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No review cycles found</p>
              <p className="text-sm text-gray-500">Create your first review cycle to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{employees.length}</p>
          <p className="text-gray-400">Total Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{employees.length}</p>
          <p className="text-gray-400">Active Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {cycles.filter(c => c.status === 'active').length}
          </p>
          <p className="text-gray-400">Active Cycles</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-400">0</p>
          <p className="text-gray-400">Manager Relations</p>
        </div>
      </div>

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <CreateCycleModal 
          supabase={supabase}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// Simple Create Cycle Modal Component
function CreateCycleModal({ supabase, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate) {
      setError('All fields are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data, error } = await supabase.rpc('create_simple_review_cycle', {
        p_name: formData.name,
        p_start_date: formData.startDate,
        p_end_date: formData.endDate
      });

      if (error) throw error;

      if (data && data.success) {
        alert('✅ ' + data.message);
        onSuccess();
      } else {
        setError(data?.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Create Review Cycle</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cycle Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder="e.g., Q1 2025 Performance Review"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
              required
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-white disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
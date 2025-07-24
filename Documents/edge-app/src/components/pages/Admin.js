// src/components/pages/Admin.js - Fixed data fetching
import React, { useEffect, useState } from 'react';
import { Users, Calendar } from 'lucide-react';

export default function Admin({ supabase }) {
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Admin: Fetching data...');
      
      // Fetch employees - direct table query
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, email, job_title, is_active, created_at')
        .eq('is_active', true)
        .order('name');
      
      if (employeesError) {
        console.error('❌ Employees error:', employeesError);
        throw employeesError;
      }
      
      console.log('✅ Employees loaded:', employeesData);
      setEmployees(employeesData || []);

      // Fetch review cycles
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('review_cycles')
        .select('id, name, status, start_date, end_date, created_at')
        .order('created_at', { ascending: false });
      
      if (cyclesError) {
        console.error('❌ Cycles error:', cyclesError);
        // Don't throw here, just log and continue
        setCycles([]);
      } else {
        console.log('✅ Cycles loaded:', cyclesData);
        setCycles(cyclesData || []);
      }

    } catch (err) {
      console.error('💥 Admin fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">Admin Panel</h1>
        <div className="text-center py-8">Loading admin data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">Admin Panel</h1>
        <div className="text-red-400 text-center py-8">
          <p>Error loading data: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Admin Panel</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employees Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="mr-2 text-cyan-400" size={24} />
            <h2 className="text-xl font-semibold">Employees ({employees.length})</h2>
          </div>
          
          {employees.length > 0 ? (
            <div className="space-y-3">
              {employees.slice(0, 8).map((employee) => (
                <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-white">{employee.name}</p>
                    <p className="text-sm text-gray-400">{employee.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-200">
                      {employee.job_title || 'No Title'}
                    </span>
                  </div>
                </div>
              ))}
              {employees.length > 8 && (
                <p className="text-center text-gray-400 text-sm">
                  ... and {employees.length - 8} more employees
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">No employees found</p>
          )}
        </div>

        {/* Review Cycles Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="mr-2 text-cyan-400" size={24} />
            <h2 className="text-xl font-semibold">Review Cycles ({cycles.length})</h2>
          </div>
          
          {cycles.length > 0 ? (
            <div className="space-y-3">
              {cycles.slice(0, 5).map((cycle) => (
                <div key={cycle.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-white">{cycle.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    cycle.status === 'active' 
                      ? 'bg-green-600 text-white' 
                      : cycle.status === 'upcoming'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}>
                    {cycle.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No review cycles found</p>
              <p className="text-sm text-gray-500">Create your first review cycle to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-cyan-400">{employees.length}</p>
          <p className="text-gray-400">Total Employees</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-green-400">{cycles.filter(c => c.status === 'active').length}</p>
          <p className="text-gray-400">Active Cycles</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-yellow-400">{cycles.filter(c => c.status === 'upcoming').length}</p>
          <p className="text-gray-400">Upcoming Cycles</p>
        </div>
      </div>
    </div>
  );
}
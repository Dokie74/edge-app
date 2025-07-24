// src/components/pages/Admin.js - Basic admin component
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
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // Fetch review cycles
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('review_cycles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cyclesError) throw cyclesError;
      setCycles(cyclesData || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading admin data...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

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
          
          <div className="space-y-3">
            {employees.slice(0, 5).map((employee) => (
              <div key={employee.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-400">{employee.email}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-600 rounded">
                  {employee.job_title || 'No Title'}
                </span>
              </div>
            ))}
            {employees.length > 5 && (
              <p className="text-center text-gray-400 text-sm">
                ... and {employees.length - 5} more
              </p>
            )}
          </div>
        </div>

        {/* Review Cycles Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="mr-2 text-cyan-400" size={24} />
            <h2 className="text-xl font-semibold">Review Cycles ({cycles.length})</h2>
          </div>
          
          <div className="space-y-3">
            {cycles.slice(0, 5).map((cycle) => (
              <div key={cycle.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div>
                  <p className="font-medium">{cycle.name}</p>
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
            {cycles.length === 0 && (
              <p className="text-center text-gray-400 py-4">No review cycles found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
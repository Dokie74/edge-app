import React, { useEffect, useState } from 'react';

export default function Dashboard({ supabase }) {
  const [teamStatus, setTeamStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data, error } = await supabase.rpc('get_team_status');
      if (error) {
        setError(error.message);
      } else {
        setTeamStatus(data);
      }
      setLoading(false);
    };
    fetchStatus();
  }, [supabase]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Team Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Job Title</th>
              <th className="px-4 py-2 text-left">Assessment Status</th>
            </tr>
          </thead>
          <tbody>
            {teamStatus.map((row) => (
              <tr key={row.employee_id} className="even:bg-gray-800">
                <td className="px-4 py-2">{row.employee_name}</td>
                <td className="px-4 py-2">{row.job_title}</td>
                <td className="px-4 py-2 capitalize">{row.assessment_status ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
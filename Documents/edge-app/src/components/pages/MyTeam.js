import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

export default function MyTeam({ supabase, openModal, setActivePage }) {
  const [teamStatus, setTeamStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_team_status');
    if (error) setError(error.message);
    else setTeamStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // real‑time updates optional: supabase.channel()
  }, []);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">My Team</h2>
        <button
          onClick={() => openModal('startReviewCycle', { afterSave: load })}
          className="flex items-center bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg shadow">
          <Play size={16} className="mr-2" />
          Start Review Cycle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Job Title</th>
              <th className="px-4 py-2 text-left">Assessment Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {teamStatus.map((row) => (
              <tr key={row.employee_id} className="even:bg-gray-800">
                <td className="px-4 py-2">{row.employee_name}</td>
                <td className="px-4 py-2">{row.job_title}</td>
                <td className="px-4 py-2 capitalize">{row.assessment_status ?? '—'}</td>
                <td className="px-4 py-2 text-right">
                  {row.assessment_id && (
                    <button
                      onClick={() => setActivePage({ name: 'Assessment', props: { assessmentId: row.assessment_id } })}
                      className="text-cyan-400 hover:underline">
                      Open
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
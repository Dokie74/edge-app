import React, { useEffect, useState } from 'react';

export default function Assessment({ supabase, pageProps, setActivePage }) {
  const { assessmentId } = pageProps;
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const { data, error } = await supabase.rpc('get_assessment_details', { p_assessment_id: assessmentId });
      if (error) setError(error.message);
      else setAssessment(data?.[0]);
      setLoading(false);
    };
    fetchDetails();
  }, [supabase, assessmentId]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;
  if (!assessment) return <div className="p-8">No data</div>;

  return (
    <div className="p-8 space-y-6">
      <button onClick={() => setActivePage({ name: 'My Team', props: {} })} className="text-cyan-400 hover:underline">← Back to My Team</button>

      <h2 className="text-2xl font-semibold">{assessment.employee_name}</h2>
      <p className="text-gray-400">Review Cycle: {assessment.review_cycle_name}</p>

      <section>
        <h3 className="text-xl font-semibold mb-2 mt-6">GWC</h3>
        <ul className="space-y-1 text-gray-300 list-disc list-inside">
          <li>Gets It: {assessment.gwc_gets_it ? '✅' : '❌'} — {assessment.gwc_gets_it_feedback}</li>
          <li>Wants It: {assessment.gwc_wants_it ? '✅' : '❌'} — {assessment.gwc_wants_it_feedback}</li>
          <li>Capacity: {assessment.gwc_capacity ? '✅' : '❌'} — {assessment.gwc_capacity_feedback}</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2 mt-6">Strengths & Improvements</h3>
        <p className="mb-2"><strong>Strengths:</strong> {assessment.employee_strengths}</p>
        <p><strong>Improvements:</strong> {assessment.employee_improvements}</p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2 mt-6">Rocks</h3>
        <ul className="space-y-2">
          {assessment.rocks?.map((rock) => (
            <li key={rock.id} className="p-3 bg-gray-800 rounded-lg">{rock.description} — <span className="capitalize text-gray-400">{rock.status}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
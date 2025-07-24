// src/components/pages/MyReviews.js
import React, { useEffect, useState } from 'react';

export default function MyReviews({ supabase }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError(sessionError?.message || "No active session");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('id, review_cycle_id, status, review_cycles(name)')
        .eq('employee_id', session.user.id);

      if (error) setError(error.message);
      else setReviews(data);

      setLoading(false);
    };

    fetchReviews();
  }, [supabase]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (error)   return <div className="p-8 text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">My Reviews</h2>
      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="p-4 bg-gray-800 rounded-lg shadow flex justify-between">
            <span>
              {r.review_cycles?.name ?? 'Unnamed Cycle'} — <span className="capitalize">{r.status}</span>
            </span>
            <span className="text-sm text-gray-400">ID: {r.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

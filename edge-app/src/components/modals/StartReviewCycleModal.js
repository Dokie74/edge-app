import React, { useEffect, useState } from 'react';

export default function StartReviewCycleModal({ supabase, closeModal, modalProps }) {
  const [cycles, setCycles] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCycles = async () => {
      const { data, error } = await supabase
        .from('review_cycles')
        .select('id, name, status')
        .eq('status', 'active');
      if (error) setError(error.message);
      else setCycles(data);
      setLoading(false);
    };
    fetchCycles();
  }, [supabase]);

  const start = async () => {
    if (!selected) return;
    setSubmitting(true);
    const { error } = await supabase.rpc('start_review_cycle_for_my_team', { cycle_id_to_start: selected });
    if (error) setError(error.message);
    else {
      if (modalProps?.afterSave) await modalProps.afterSave();
      closeModal();
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading…</div>;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Start Review Cycle</h2>
      {error && <p className="text-red-400 mb-2">{error}</p>}
      <label className="block mb-4">
        <span className="text-sm">Select Active Cycle</span>
        <select
          value={selected}
          onChange={(e) => setSelected(parseInt(e.target.value))}
          className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
          <option value="">— choose —</option>
          {cycles.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <div className="flex justify-end space-x-2">
        <button onClick={closeModal} className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600">Cancel</button>
        <button
          onClick={start}
          disabled={!selected || submitting}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">
          {submitting ? 'Starting…' : 'Start'}
        </button>
      </div>
    </div>
  );
}
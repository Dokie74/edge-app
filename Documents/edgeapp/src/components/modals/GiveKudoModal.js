// src/components/modals/GiveKudoModal.js
import React, { useState, useEffect } from 'react';
import { Award, X } from 'lucide-react';

const GiveKudoModal = ({ supabase, closeModal, modalProps }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedCoreValue, setSelectedCoreValue] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const coreValues = [
        "Passionate about our purpose",
        "Driven to be the best",
        "Resilient, rising stronger together",
        "Respond swiftly and positively"
    ];

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const { data, error } = await supabase.rpc('get_all_employees');
                if (error) throw error;
                setEmployees(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedEmployee || !selectedCoreValue || !comment.trim()) {
            setError('All fields are required.');
            return;
        }
        
        setError('');
        setSubmitting(true);

        try {
            const { data, error: rpcError } = await supabase.rpc('give_kudo', {
                p_receiver_id: selectedEmployee,
                p_core_value: selectedCoreValue,
                p_comment: comment.trim()
            });
            
            if (rpcError) throw rpcError;

            if (data.success) {
                // Call the onComplete callback if provided
                if (modalProps?.onComplete) {
                    modalProps.onComplete();
                }
                closeModal();
            } else {
                setError(data.error || 'Failed to send kudo');
            }
        } catch (err) {
            setError(`Failed to send kudo: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedEmployee('');
        setSelectedCoreValue('');
        setComment('');
        setError('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Award className="text-yellow-400 mr-3" size={24} />
                        <h3 className="text-2xl font-bold text-yellow-400">Give a Kudo</h3>
                    </div>
                    <button 
                        onClick={closeModal} 
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-yellow-400">Loading employees...</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Employee Selection */}
                        <div>
                            <label htmlFor="employee" className="block text-sm font-medium text-gray-300 mb-2">
                                To: *
                            </label>
                            <select
                                id="employee"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Core Value Selection */}
                        <div>
                            <label htmlFor="coreValue" className="block text-sm font-medium text-gray-300 mb-2">
                                For (Core Value): *
                            </label>
                            <select
                                id="coreValue"
                                value={selectedCoreValue}
                                onChange={(e) => setSelectedCoreValue(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                            >
                                <option value="">Select Core Value</option>
                                {coreValues.map(cv => (
                                    <option key={cv} value={cv}>{cv}</option>
                                ))}
                            </select>
                        </div>

                        {/* Comment */}
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                                Comment: *
                            </label>
                            <textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe what this person did that exemplifies this core value..."
                                rows="4"
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                                required
                            />
                            <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>Be specific about what they did that was great!</span>
                                <span>{comment.length}/500</span>
                            </div>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 bg-red-900 rounded border border-red-700 text-red-200">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !selectedEmployee || !selectedCoreValue || !comment.trim()}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-md disabled:bg-gray-500 disabled:text-gray-300 transition flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Award size={16} className="mr-2" />
                                        Send Kudo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tips */}
                <div className="mt-6 p-4 bg-yellow-900 rounded-lg border border-yellow-700">
                    <h4 className="text-yellow-200 font-semibold mb-2">Tips for Great Kudos:</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                        <li>• Be specific about what they did</li>
                        <li>• Explain the positive impact it had</li>
                        <li>• Connect it clearly to the core value</li>
                        <li>• Make it personal and meaningful</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GiveKudoModal;
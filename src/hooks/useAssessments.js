import { useState, useEffect } from 'react';
import { AssessmentService } from '../services';

export const useAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AssessmentService.getMyAssessments();
      setAssessments(data);
    } catch (err) {
      console.error('Error fetching assessments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const refresh = () => {
    fetchAssessments();
  };

  return {
    assessments,
    loading,
    error,
    refresh
  };
};
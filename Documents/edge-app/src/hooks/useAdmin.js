import { useState, useEffect } from 'react';
import { AdminService } from '../services';

export const useAdmin = () => {
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [employeesData, cyclesData] = await Promise.all([
        AdminService.getAllEmployees(),
        AdminService.getReviewCycles()
      ]);
      
      setEmployees(employeesData);
      setCycles(cyclesData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createReviewCycle = async (cycleData) => {
    try {
      const result = await AdminService.createReviewCycle(cycleData);
      await fetchData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error creating review cycle:', err);
      throw err;
    }
  };

  const activateReviewCycle = async (cycleId) => {
    try {
      const result = await AdminService.activateReviewCycle(cycleId);
      await fetchData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error activating review cycle:', err);
      throw err;
    }
  };

  const refresh = () => {
    fetchData();
  };

  return {
    employees,
    cycles,
    loading,
    error,
    createReviewCycle,
    activateReviewCycle,
    refresh
  };
};
import { useState, useEffect } from 'react';
import { TeamService } from '../services';

export const useTeam = () => {
  const [team, setTeam] = useState([]);
  const [teamAssessments, setTeamAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [teamData, assessmentsData] = await Promise.all([
        TeamService.getMyTeam(),
        TeamService.getTeamAssessments()
      ]);
      
      setTeam(teamData);
      setTeamAssessments(assessmentsData);
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const startReviewCycle = async (cycleData) => {
    try {
      const result = await TeamService.startReviewCycle(cycleData);
      await fetchTeamData(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error starting review cycle:', err);
      throw err;
    }
  };

  const refresh = () => {
    fetchTeamData();
  };

  return {
    team,
    teamAssessments,
    loading,
    error,
    startReviewCycle,
    refresh
  };
};
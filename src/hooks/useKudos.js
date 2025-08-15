import { useState, useEffect } from 'react';
import { KudosService } from '../services';

export const useKudos = () => {
  const [kudos, setKudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKudos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await KudosService.getKudosWall();
      setKudos(data);
    } catch (err) {
      console.error('Error fetching kudos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKudos();
  }, []);

  const giveKudos = async (kudosData) => {
    try {
      await KudosService.giveKudos(kudosData);
      await fetchKudos(); // Refresh the list
    } catch (err) {
      console.error('Error giving kudos:', err);
      throw err;
    }
  };

  const refresh = () => {
    fetchKudos();
  };

  return {
    kudos,
    loading,
    error,
    giveKudos,
    refresh
  };
};
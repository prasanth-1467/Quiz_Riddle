import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useContext(SocketContext);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/teams/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    if (!socket) return;

    const handleLeaderboardUpdate = (updatedData) => {
      console.log('[Socket Event] leaderboard:update received:', updatedData);
      setLeaderboard(updatedData);
    };

    socket.on('leaderboard:update', handleLeaderboardUpdate);

    return () => {
      socket.off('leaderboard:update', handleLeaderboardUpdate);
    };
  }, [socket]);

  return { leaderboard, loading, refreshLeaderboard: fetchLeaderboard };
};

export default useLeaderboard;

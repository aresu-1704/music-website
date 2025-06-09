import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The token will be automatically saved by spotifyService
    navigate('/discover');
  }, [navigate]);

  return (
    <div className="text-center p-5">
      <h2>Connecting to Spotify...</h2>
    </div>
  );
};

export default CallbackPage; 
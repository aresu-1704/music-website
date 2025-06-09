import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The access token will be in the URL hash
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial, item) => {
        let parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {});

    if (hash.access_token) {
      // Store the token in localStorage
      localStorage.setItem('spotify_token', hash.access_token);
      // Redirect to home page
      navigate('/');
    } else {
      // If no token, redirect to sign in
      navigate('/signin');
    }
  }, [navigate]);

  return (
    <div className="text-center p-5">
      <h2>Processing authentication...</h2>
      <p>Please wait while we complete your login.</p>
    </div>
  );
};

export default CallbackPage; 
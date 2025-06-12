// import React, { useState, useEffect } from 'react';
// import { getSpotifyLoginUrl, handleCallback, getTopTracks, createPlaylist } from '../services/spotifyPublicService';
// import { useLocation, useNavigate } from 'react-router-dom';
//
// const DiscoverPage = () => {
//   const [topTracks, setTopTracks] = useState([]);
//   const [playlistId, setPlaylistId] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const location = useLocation();
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     const initializeSpotify = async () => {
//       try {
//         // Check if we're returning from Spotify auth
//         const params = new URLSearchParams(location.search);
//         const code = params.get('code');
//
//         if (code) {
//           // Handle the callback
//           await handleCallback(code);
//           // Remove the code from URL
//           navigate(location.pathname, { replace: true });
//         }
//
//         // Try to fetch data
//         await fetchData();
//       } catch (error) {
//         console.error('Authentication error:', error);
//         if (error.message === 'Not authenticated') {
//           // Redirect to Spotify login
//           const authUrl = await getSpotifyLoginUrl();
//           window.location.href = authUrl;
//         } else {
//           setError(error.message);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     initializeSpotify();
//   }, [location, navigate]);
//
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const tracks = await getTopTracks();
//       setTopTracks(tracks);
//
//       if (tracks && tracks.length > 0) {
//         const tracksUri = tracks.map(track => track.uri);
//         const playlist = await createPlaylist(
//           "My Top Tracks",
//           "Playlist created from my top tracks",
//           tracksUri
//         );
//         setPlaylistId(playlist.id);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//
//   return (
//     <div className="discover-page">
//       <h1>Discover Your Top Tracks</h1>
//
//       <div className="top-tracks">
//         <h2>Your Top 5 Tracks</h2>
//         {topTracks.length > 0 ? (
//           <ul>
//             {topTracks.map((track) => (
//               <li key={track.id}>
//                 {track.name} by {track.artists.map(artist => artist.name).join(', ')}
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>No tracks found. Please try again later.</p>
//         )}
//       </div>
//
//       {playlistId && (
//         <div className="spotify-player">
//           <h2>Listen to Your Playlist</h2>
//           <iframe
//             title="Spotify Embed: Your Top Tracks Playlist"
//             src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
//             width="100%"
//             height="360"
//             style={{ border: 'none' }}
//             allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
//             loading="lazy"
//           />
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default DiscoverPage;
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PlayCircle, Heart, Info } from 'lucide-react';
import { fetchSearchResults } from '../services/searchService';
import '../styles/Discover.css';
import { useMusicPlayer } from '../context/musicPlayerContext';
import {Spinner} from "react-bootstrap";

const MusicCard = ({ id, title, artist, imageUrl, likeCount, playCount, onPlay }) => {
  const [hover, setHover] = useState(false);
  
  const handlePlay = (e) => {
    e.preventDefault();
    onPlay();
  };
  
  return (
    <div
      className="music-card text-center text-white px-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: 'pointer' }}
    >
      <Link to={`/track/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={imageUrl || '/images/default-music.jpg'}
          alt={title}
          style={{
            width: '100%',
            height: '340px',
            objectFit: 'cover',
            borderRadius: '16px',
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.6)',
          }}
        />
        <div className="music-icons-top d-flex gap-3">
          <Info size={22} color="white" />
        </div>
        {hover && (
          <div className="music-card-overlay">
            <button className="play-button border-0 bg-transparent" onClick={handlePlay}>
              <PlayCircle size={60} color="white" />
            </button>
          </div>
        )}
        <div className="mt-3">
          <div className="fw-bold" style={{ fontSize: '16px', color: '#fff' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#ccc' }}>{artist}</div>
          <div style={{ fontSize: '13px', color: '#ccc' }}>
            {likeCount} likes | {playCount} plays
          </div>
        </div>
      </Link>
    </div>
  );
};

const SearchForm = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || searchParams.get('q') || '';
  const [results, setResults] = useState({ tracks: [], users: [] });
  const [loading, setLoading] = useState(false);
  const { playTrackList } = useMusicPlayer();

  useEffect(() => {
    if (!query) {
      setResults({ tracks: [], users: [] });
      return;
    }
    setLoading(true);
    fetchSearchResults(query)
      .then(data => setResults(data))
      .catch(() => setResults({ tracks: [], users: [] }))
      .finally(() => setLoading(false));
  }, [query]);

  const handlePlayTrack = (track) => {
    // Tạo playlist tạm thời từ kết quả tìm kiếm
    const searchPlaylist = results.tracks.map(track => ({
      id: track.id,
      title: track.title,
      subtitle: track.artistId || 'Unknown Artist',
      imageUrl: track.imageBase64 || '/images/default-music.jpg',
      url: track.audioUrl || ''
    }));
    
    // Tìm index của track được chọn
    const trackIndex = searchPlaylist.findIndex(t => t.id === track.id);
    
    // Phát nhạc với playlist tạm thời
    if (trackIndex !== -1) {
      playTrackList(searchPlaylist, trackIndex);
    }
  };

  return (
    <div className="bg-dark py-5" style={{ minHeight: '100vh' }}>
      <div className="container">
        <h2 className="text-white mb-4">Kết quả tìm kiếm cho "{query}"</h2>
        {loading && (
            <div className="d-flex justify-content-center align-items-center vh-100">
              <Spinner animation="border" role="status" />
            </div>
        )}

        {!loading && (
          <>
            {/* Tracks Section */}
            {results.tracks.length > 0 && (
              <>
                <h4 className="text-white mb-4">🎵 Bài hát</h4>
                <div className="row">
                  {results.tracks.map((track) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={track.id}>
                      <MusicCard
                        id={track.id}
                        title={track.title}
                        artist={track.artistId}
                        imageUrl={track.imageBase64 || '/images/default-music.jpg'}
                        likeCount={track.likeCount}
                        playCount={track.playCount}
                        onPlay={() => handlePlayTrack(track)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Users Section */}
            {results.users.length > 0 && (
              <>
                <h4 className="text-white mb-4">👤 Người dùng</h4>
                <div className="row">
                  {results.users.map((user) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={user.id}>
                      <Link to={`/profile/${user.id}`} className="text-decoration-none">
                        <div className="bg-secondary bg-opacity-10 rounded-4 p-4 d-flex align-items-center gap-3">
                          <img
                            src={user.avatarUrl || '/images/default-avatar.png'}
                            alt={user.name}
                            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff2' }}
                          />
                          <div>
                            <div className="fw-bold text-white" style={{ fontSize: 16 }}>{user.name}</div>
                            <div style={{ color: '#bbb', fontSize: 13 }}>@{user.username}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}

            {results.tracks.length === 0 && results.users.length === 0 && (
              <div className="text-center mt-4 text-white">
                Không có kết quả
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
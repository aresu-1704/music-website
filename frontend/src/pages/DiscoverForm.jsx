import React, { useEffect, useState } from 'react';
import {Container, Button, Spinner} from 'react-bootstrap';
import { PlayCircle, Heart, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import {getTopLikeTracks, getTopTracks} from "../services/trackService";
import { useMusicPlayer } from '../context/musicPlayerContext';
import '../styles/Discover.css'

const MusicCard = ({ title, subtitle, imageUrl, onPlay }) => {
    const [hover, setHover] = useState(false);

    return (
        <div
            className="music-card text-center text-white px-2"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ cursor: 'pointer' }}
        >
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
                <Heart size={22} />
                <Info size={22} />
            </div>

            <div className="music-card-overlay">
                <button className="play-button border-0 bg-transparent" onClick={onPlay}>
                    <PlayCircle size={60} color="white" />
                </button>
            </div>

            <div className="mt-3">
                <div className="fw-bold" style={{ fontSize: '16px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#ccc' }}>{subtitle}</div>
            </div>
        </div>
    );
};

const ScrollableSection = ({ title, items, onPlay }) => {
    const visibleCount = 5;
    const [startIndex, setStartIndex] = useState(0);
    const maxStartIndex = Math.max(0, items.length - visibleCount);

    const handlePrev = () => setStartIndex((prev) => Math.max(prev - visibleCount, 0));
    const handleNext = () => setStartIndex((prev) => Math.min(prev + visibleCount, maxStartIndex));

    useEffect(() => setStartIndex(0), [items]);

    const visibleItems = items.slice(startIndex, startIndex + visibleCount);

    return (
        <div className="mb-5">
            <h4 className="text-white mb-4">{title}</h4>

            <div className="position-relative" style={{ height: '400px' }}>
                <div className="d-flex overflow-hidden flex-nowrap w-100 h-100" style={{ padding: '0 60px' }}>
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            style={{ flex: `0 0 calc(100% / ${visibleCount})`, padding: '0 8px' }}
                        >
                            <MusicCard {...item} onPlay={() => onPlay(item)} />
                        </div>
                    ))}
                </div>
                <Button variant="dark" onClick={handlePrev} disabled={startIndex === 0} style={navBtnStyle('left')}>
                    <ChevronLeft size={24} />
                </Button>
                <Button variant="dark" onClick={handleNext} disabled={startIndex >= maxStartIndex} style={navBtnStyle('right')}>
                    <ChevronRight size={24} />
                </Button>
            </div>
        </div>
    );
};

const navBtnStyle = (side) => ({
    position: 'absolute',
    top: '44%',
    [side]: '10px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    height: '48px',
    width: '48px',
    borderRadius: '50%',
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
});

const DiscoverForm = () => {
    const [trendingSongs, setTrendingSongs] = useState([]);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { playTrackList } = useMusicPlayer();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const trackList = await getTopTracks();
            const likeLists = await getTopLikeTracks();

            const topSongs = trackList.map((track, index) => ({
                id: track.id || index,
                title: track.title || `Bài hát ${index + 1}`,
                subtitle: 'Top Trending',
                imageUrl: track.imageBase64 || '/images/default-music.jpg',
                url: track.audioUrl || ''
            }));

            const topFavoritesSongs = likeLists.map((track, index) => ({
                id: track.id || index,
                title: track.title || `Bài hát ${index + 1}`,
                subtitle: 'Top Trending',
                imageUrl: track.imageBase64 || '/images/default-music.jpg',
                url: track.audioUrl || ''
            }));

            setTrendingSongs(topSongs);
            setFavoriteSongs(topFavoritesSongs);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <>
            {isLoading && (
                <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <Spinner animation="border" role="status" />
                    </div>
                </Container>
            )}

            {!isLoading && (
                <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                    <ScrollableSection
                        title="Những bài hát phổ biến nhất"
                        items={trendingSongs}
                        onPlay={(track) => {
                            const index = trendingSongs.findIndex(t => t.id === track.id);
                            playTrackList(trendingSongs, index);
                        }}
                    />
                    <ScrollableSection
                        title="Những bài hát được yêu thích nhất"
                        items={favoriteSongs}
                        onPlay={(track) => {
                            const index = trendingSongs.findIndex(t => t.id === track.id);
                            playTrackList(trendingSongs, index);
                        }}
                    />
                </Container>
            )}
        </>
    );
};

export { DiscoverForm };
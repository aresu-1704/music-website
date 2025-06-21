import React, { useEffect, useState } from 'react';
import {Container, Button, Badge, Spinner} from 'react-bootstrap';
import { PlayCircle, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { useMusicPlayer } from '../context/musicPlayerContext';
import '../styles/Discover.css'
import {useNavigate, useParams} from "react-router-dom";
import {getRecommendTrack} from "../services/recommendService";
import {useAuth} from "../context/authContext";
import {useLoginSessionOut} from "../services/loginSessionOut";

const MusicCard = ({ id, title, subtitle, imageUrl, isPublic, onPlay, onInfo }) => {
    const [hover, setHover] = useState(false);
    return (
        <>
            <div
                className="music-card text-white px-2"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{ cursor: 'pointer', position: 'relative', height: '340px', borderRadius: '16px', overflow: 'hidden' }}
            >
                <img
                    src={imageUrl || '/images/default-music.jpg'}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        transition: 'opacity 0.3s',
                        borderRadius: '16px',
                    }}
                />


                {!isPublic && (
                    <Badge
                        bg="warning"
                        text="dark"
                        className="position-absolute top-0 end-0 m-3"
                        style={{ zIndex: 3 }}
                    >
                        👑 VIP
                    </Badge>
                )}

                <div className="music-icons-top d-flex gap-3 position-absolute top-0 start-0 m-3" style={{ zIndex: 3 }}>
                    <Info size={22} onClick={onInfo} style={{ cursor: 'pointer' }} />
                </div>

                <div
                    className="music-card-overlay d-flex align-items-center justify-content-center"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        opacity: hover ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    <button className="play-button border-0 bg-transparent">
                        <PlayCircle size={100} color="white" onClick={onPlay} />
                    </button>
                </div>
            </div>

            <div
                className="music-info position-absolute text-start w-100 px-3"
                style={{
                    bottom: '10px',
                    zIndex: 3,
                    color: 'white',
                    textShadow: '0 0 4px black',
                    width: '100%',
                    maxWidth: 'calc(100% - 16px)',
                    overflow: 'hidden',
                }}
            >
                <div
                    className="fw-bold"
                    style={{
                        fontSize: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </div>

                <div
                    style={{
                        fontSize: '13px',
                        color: '#ccc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {subtitle}
                </div>
            </div>

        </>
    );
};

const ScrollableSection = ({ title, items, onPlay, onInfo }) => {
    const visibleCount = 5;
    const [startIndex, setStartIndex] = useState(0);
    const maxStartIndex = Math.max(0, items.length - visibleCount);

    const handlePrev = () => setStartIndex((prev) => Math.max(prev - visibleCount, 0));
    const handleNext = () => setStartIndex((prev) => Math.min(prev + visibleCount, maxStartIndex));

    useEffect(() => setStartIndex(0), [items]);

    const visibleItems = items.slice(startIndex, startIndex + visibleCount);

    if (visibleItems == null) {
        return (
            <div className="text-center mt-4 text-white">
                Không có kết quả
            </div>
        )
    }

    return (
        <div className="mb-5">
            <h4 className="text-white mb-4">{title}</h4>

            <div className="scrollable-wrapper position-relative" style={{ height: '400px' }}>
                <div className="d-flex overflow-hidden flex-nowrap w-100 h-100" style={{ padding: '0 60px' }}>
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            style={{ flex: `0 0 calc(100% / ${visibleCount})`, padding: '0 8px' }}
                        >
                            <MusicCard {...item} onPlay={() => onPlay(item)} onInfo={() => onInfo(item)} />
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

const RecommendForm = () => {
    const [recommendSongs, setRecommendSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { playTrackList } = useMusicPlayer();
    const { userId } = useParams();
    const handleSessionOut = useLoginSessionOut();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const recommendList = await getRecommendTrack(userId, handleSessionOut);

            const lists = recommendList.map((track, index) => ({
                id: track.id || index,
                title: track.title || `Bài hát ${index + 1}`,
                subtitle: 'Gợi ý cho bạn',
                imageUrl: track.imageBase64 || '/images/default-music.jpg',
                isPublic: track.isPublic,
            }));

            setRecommendSongs(lists);
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
                        title="Dành cho bạn (Dựa vào những bài hát bạn nghe gần đây)"
                        items={recommendSongs}
                        onPlay={(track) => {
                            const index = recommendSongs.findIndex(t => t.id === track.id);
                            playTrackList(recommendSongs, index);
                        }}
                        onInfo={(track) => navigate(`/track/${track.id}`)}
                    />
                </Container>
            )}
        </>
    );
};

export default RecommendForm;

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Spinner, Badge, Modal, Button } from 'react-bootstrap';
import { PlayCircle, Info, Heart, HeartOff } from 'lucide-react';
import {
    getMyFavoriteTracks,
    toggleFavorites,
    deleteAllFavorites
} from '../services/favoritesService';
import { useMusicPlayer } from '../context/musicPlayerContext';
import { useNavigate } from 'react-router-dom';

const MusicCard = ({ track, isFavorite, onToggleFavorite, onPlay, onInfo }) => {
    const [hover, setHover] = useState(false);

    return (
        <div
            className="music-card text-center text-white px-2"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ cursor: 'pointer' }}
        >
            <div>
                <img
                    src={track.imageUrl || '/images/default-music.jpg'}
                    alt={track.title}
                    style={{
                        width: '100%',
                        height: '340px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.6)',
                    }}
                />
                {!track.isPublic && (
                    <Badge
                        bg="warning"
                        text="dark"
                        className="position-absolute top-0 end-0 m-3"
                    >
                        👑 VIP
                    </Badge>
                )}
            </div>
            <div className="music-icons-top d-flex gap-3 position-absolute top-0 start-0 m-3">
                <Info size={22} color="white" onClick={() => onInfo(track)} />
                {isFavorite !== undefined && (
                    isFavorite ? (
                        <HeartOff
                            size={22}
                            color="white"
                            onClick={() => onToggleFavorite(track)}
                            style={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <Heart
                            size={22}
                            color="white"
                            onClick={() => onToggleFavorite(track)}
                            style={{ cursor: 'pointer' }}
                        />
                    )
                )}
            </div>
            {hover && (
                <div className="music-card-overlay">
                    <button className="play-button border-0 bg-transparent" onClick={(e) => { e.stopPropagation(); onPlay(track); }}>
                        <PlayCircle size={60} color="white" />
                    </button>
                </div>
            )}
            <div className="mt-3">
                <div className="fw-bold" style={{ fontSize: '16px' }}>{track.title}</div>
                <div style={{ fontSize: '13px', color: '#ccc' }}>{track.subtitle || ''}</div>
            </div>
        </div>
    );
};

const FavoriteForm = () => {
    const [favoriteTracks, setFavoriteTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const { playTrackList } = useMusicPlayer();
    const navigate = useNavigate();

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        const data = await getMyFavoriteTracks(() => {});
        setFavoriteTracks(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFavorites();

        const handleUpdate = () => fetchFavorites();
        window.addEventListener('favorite-updated', handleUpdate);

        return () => window.removeEventListener('favorite-updated', handleUpdate);
    }, [fetchFavorites]);

    const handlePlay = (track) => {
        const playlist = favoriteTracks.map(t => ({
            id: t.id || t.trackId,
            title: t.title,
            subtitle: t.artistId || '',
            imageUrl: t.imageBase64 || (t.cover ? `/backend/storage/cover_images/${t.cover}` : null) || '/images/default-music.jpg',
            url: t.filename || '',
            isPublic: t.isPublic,
        }));

        const index = playlist.findIndex(t => t.id === (track.id || track.trackId));
        playTrackList(playlist, index);
    };

    const handleInfo = (track) => {
        navigate(`/track/${track.id || track.trackId}`);
    };

    const handleToggleFavorite = async (track) => {
        const trackId = track.id || track.trackId;
        await toggleFavorites(trackId, () => {});
        setFavoriteTracks(prev => prev.filter(t => (t.id || t.trackId) !== trackId));
    };


    const isFavorite = (trackId) => {
        return favoriteTracks.some(t => (t.id || t.trackId) === trackId);
    };

    const handleDeleteAll = () => {
        setShowConfirmDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        await deleteAllFavorites(() => {});
        setFavoriteTracks([]); // clear toàn bộ luôn
        setShowConfirmDeleteModal(false);
    };


    const handleCancelDelete = () => {
        setShowConfirmDeleteModal(false);
    };

    return (
        <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
            <h2 className="text-white mb-4 d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2">
                    <span role="img" aria-label="heart">❤️</span>
                    <span>Danh sách bài hát đã yêu thích</span>
                </span>
                {favoriteTracks.length > 0 && (
                    <button className="btn btn-danger" onClick={handleDeleteAll}>
                        Xóa tất cả yêu thích
                    </button>
                )}
            </h2>

            <Modal show={showConfirmDeleteModal} onHide={handleCancelDelete} centered>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>Xác nhận xóa tất cả</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">Bạn có chắc chắn muốn xóa tất cả nhạc yêu thích?</Modal.Body>
                <Modal.Footer className="bg-dark">
                    <Button variant="secondary" onClick={handleCancelDelete}>Không</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Có</Button>
                </Modal.Footer>
            </Modal>

            {loading ? (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" />
                </div>
            ) : favoriteTracks.length === 0 ? (
                <div className="text-center text-white mt-5">Bạn chưa có bài hát yêu thích nào.</div>
            ) : (
                <div className="row">
                    {favoriteTracks.map((track) => (
                        <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={track.id || track.trackId}>
                            <MusicCard
                                track={{
                                    id: track.id || track.trackId,
                                    title: track.title,
                                    subtitle: track.artistId || '',
                                    imageUrl: track.imageBase64 || (track.cover ? `/backend/storage/cover_images/${track.cover}` : null) || '/images/default-music.jpg',
                                    isPublic: track.isPublic,
                                }}
                                isFavorite={isFavorite(track.id || track.trackId)}
                                onToggleFavorite={handleToggleFavorite}
                                onPlay={handlePlay}
                                onInfo={handleInfo}
                            />
                        </div>
                    ))}
                </div>
            )}
        </Container>
    );
};

export default FavoriteForm;

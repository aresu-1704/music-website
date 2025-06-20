import React, { useEffect, useState, useCallback } from 'react';
import { Container, Spinner, Badge, Modal, Button } from 'react-bootstrap';
import { PlayCircle, Info } from 'lucide-react';
import { getMyFavoriteTracks, toggleFavorites, checkUserIsFavorites, deleteAllFavorites } from '../services/favoritesService';
import { useMusicPlayer } from '../context/musicPlayerContext';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Discover.css';
import { useFavorite } from '../context/favoriteContext';
import '../styles/Favorite.css';

const MusicCard = ({ track, isFavorite, onToggleFavorite, onPlay, onInfo }) => {
    const [hover, setHover] = useState(false);

    return (
        <div
            className="music-card text-center text-white px-2"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ cursor: 'pointer', position: 'relative' }}
        >
            <div>
                <img
                    src={track.imageUrl || '/images/default-music.jpg'}
                    alt={track.title}
                    style={{
                        width: '100%',
                        height: '440px',
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
                <Info size={22} color="white" onClick={() => onInfo(track)} style={{ cursor: 'pointer' }} />
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
    const { favoriteTracks, isFavorite, toggleFavorite, loading } = useFavorite();
    const { playTrackList } = useMusicPlayer();
    const navigate = useNavigate();
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

    // Chuẩn hóa danh sách phát nhạc giống DiscoverForm
    const playlist = favoriteTracks.map(track => ({
        id: track.id || track.trackId,
        title: track.title,
        subtitle: track.artistId || '',
        imageUrl: track.imageBase64
            || (track.cover ? `/backend/storage/cover_images/${track.cover}` : null)
            || '/images/default-music.jpg',
        url: track.filename || '',
        isPublic: track.isPublic,
    }));

    const handlePlay = (track) => {
        const index = playlist.findIndex(t => t.id === (track.id || track.trackId));
        playTrackList(playlist, index);
    };

    const handleInfo = (track) => {
        navigate(`/track/${track.id || track.trackId}`);
    };

    const handleDeleteAll = async () => {
        setShowConfirmDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        await deleteAllFavorites(() => {});
        window.dispatchEvent(new Event('favorite-updated'));
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
            <Modal show={showConfirmDeleteModal} onHide={handleCancelDelete} centered dialogClassName="custom-modal-overlay" backdrop={true}>
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="text-white">Xác nhận xóa tất cả</Modal.Title>
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
                                    imageUrl: track.imageBase64
                                        || (track.cover ? `/backend/storage/cover_images/${track.cover}` : null)
                                        || '/images/default-music.jpg',
                                    isPublic: track.isPublic,
                                }}
                                isFavorite={isFavorite(track.id || track.trackId)}
                                onToggleFavorite={toggleFavorite}
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
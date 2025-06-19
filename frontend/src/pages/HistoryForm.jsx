import React, { useEffect, useState } from 'react';
import { Container, Button, Badge, Spinner, Modal } from 'react-bootstrap';
import { PlayCircle, Info, ChevronRight, ChevronLeft, Trash2, Clock } from 'lucide-react';
import { useMusicPlayer } from '../context/musicPlayerContext';
import { useAuth } from '../context/authContext';
import { getUserHistory, deleteHistoryTrack, deleteAllHistory } from '../services/historyService';
import '../styles/Discover.css';
import '../styles/History.css';
import { useNavigate } from "react-router-dom";

const MusicCard = ({ title, subtitle, imageUrl, isPublic, onPlay, onInfo, onDelete }) => {
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
                {!isPublic && (
                    <Badge
                        bg="warning"
                        text="dark"
                        className="position-absolute top-0 end-0 m-3"
                    >
                        👑 VIP
                    </Badge>
                )}
            </div>

            <div className="music-icons-top d-flex gap-3">
                <Info size={22} onClick={onInfo} />
                <Trash2 size={22} onClick={onDelete} className="text-danger" />
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

const ScrollableSection = ({ title, items, onPlay, onInfo, onDelete }) => {
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
                            key={item.trackId}
                            style={{ flex: `0 0 calc(100% / ${visibleCount})`, padding: '0 8px' }}
                        >
                            <MusicCard 
                                title={item.title}
                                subtitle={timeAgo(item.lastPlay)}
                                imageUrl={item.imageUrl}
                                isPublic={item.isPublic}
                                onPlay={() => onPlay(item)}
                                onInfo={() => onInfo(item)}
                                onDelete={() => onDelete(item)}
                            />
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

function timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000); // seconds

    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
    return `${Math.floor(diff / 31536000)} năm trước`;
}

const HistoryForm = () => {
    const [historyTracks, setHistoryTracks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { playTrackList } = useMusicPlayer();
    const { user } = useAuth();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // null: xóa tất cả, object: xóa 1 bài

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.isLoggedIn) {
                navigate('/signin');
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const data = await getUserHistory(user.id);
                // Transform the data to match the format needed for playTrackList and footer
                const transformedData = data.map(track => ({
                    ...track,
                    id: track.trackId, // Ensure id is available for playTrackList
                    imageUrl: track.imageBase64 // Đảm bảo có imageUrl cho footer
                }));
                setHistoryTracks(transformedData);
            } catch (error) {
                setError('Không thể tải lịch sử nghe nhạc. Vui lòng thử lại sau.');
                console.error('Error fetching history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [user, navigate]);

    const handleDeleteTrack = async (track) => {
        setDeleteTarget(track);
        setShowConfirmModal(true);
    };

    const handleDeleteAll = async () => {
        setDeleteTarget(null);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        setShowConfirmModal(false);
        if (deleteTarget) {
            // Xóa 1 bài
            try {
                await deleteHistoryTrack(deleteTarget.trackId);
                setHistoryTracks(prev => prev.filter(t => t.trackId !== deleteTarget.trackId));
            } catch (error) {
                console.error('Error deleting track from history:', error);
                setError('Không thể xóa bài hát khỏi lịch sử. Vui lòng thử lại sau.');
            }
        } else {
            // Xóa tất cả
            try {
                await deleteAllHistory();
                setHistoryTracks([]);
            } catch (error) {
                console.error('Error deleting all history:', error);
                setError('Không thể xóa lịch sử. Vui lòng thử lại sau.');
            }
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmModal(false);
        setDeleteTarget(null);
    };

    if (!user?.isLoggedIn) {
        return null; // Component will redirect in useEffect
    }

    return (
        <>
            {/* Modal xác nhận xóa */}
            <Modal show={showConfirmModal} onHide={handleCancelDelete} centered dialogClassName={"custom-modal-overlay"} backdrop={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa lịch sử</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteTarget ? (
                        <>Bạn có chắc muốn xóa bài hát <b>{deleteTarget.title}</b> khỏi lịch sử không?</>
                    ) : (
                        <>Bạn có chắc muốn <b>xóa tất cả lịch sử nghe nhạc</b> không?</>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelDelete}>Hủy</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Đồng ý</Button>
                </Modal.Footer>
            </Modal>
            {isLoading && (
                <Container fluid className="history-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                        <Spinner animation="border" role="status" />
                </Container>
            )}

            {!isLoading && (
                <Container fluid className="history-bg py-5" style={{ minHeight: '100vh' }}>
                    <div className="history-header d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 px-2 px-md-4">
                        <h2 className="history-title m-0 d-flex align-items-center gap-2">
                            <Clock size={28} className="history-clock-icon me-2" />
                            Lịch sử nghe nhạc
                        </h2>
                        {historyTracks.length > 0 && (
                            <Button className="delete-all-btn" onClick={handleDeleteAll}>
                                <Trash2 size={20} className="me-2" /> Xóa tất cả lịch sử
                            </Button>
                        )}
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    
                    {!error && historyTracks.length > 0 ? (
                        <div className="history-grid-section">
                            {historyTracks.map((track) => (
                                <div key={track.trackId} className="history-grid-item">
                                    <MusicCard
                                        title={track.title}
                                        subtitle={timeAgo(track.lastPlay)}
                                        imageUrl={track.imageUrl}
                                        isPublic={track.isPublic}
                                        onPlay={() => {
                                const index = historyTracks.findIndex(t => t.trackId === track.trackId);
                                playTrackList(historyTracks, index);
                            }}
                                        onInfo={() => navigate(`/track/${track.trackId}`)}
                                        onDelete={() => handleDeleteTrack(track)}
                        />
                                </div>
                            ))}
                        </div>
                    ) : !error && (
                        <div className="history-empty-state text-center text-white mt-5">
                            <img src="/images/default-music.jpg" alt="No history" className="empty-history-img mb-4" />
                            <h3 className="mb-2">Chưa có lịch sử nghe nhạc</h3>
                            <p className="mb-0">Hãy bắt đầu nghe nhạc để tạo lịch sử của bạn</p>
                        </div>
                    )}
                </Container>
            )}
        </>
    );
};

export default HistoryForm; 
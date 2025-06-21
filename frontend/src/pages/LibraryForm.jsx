import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { Plus, Pencil, Trash, PlayFill, Search, X } from 'react-bootstrap-icons';
import { useAuth } from '../context/authContext';
import { useMusicPlayer } from '../context/musicPlayerContext';
import { getUserPlaylists, createPlaylist, deletePlaylist, getUserPlaylistLimits } from '../services/playlistService';
import { fetchSearchResults } from '../services/searchService';
import { addTrackToPlaylist } from '../services/playlistService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Library.css';

const LibraryForm = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const { playTrackList } = useMusicPlayer();
    const navigate = useNavigate();
    
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [limits, setLimits] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddTrackModal, setShowAddTrackModal] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    // Form states
    const [playlistName, setPlaylistName] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [playlistCover, setPlaylistCover] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (userId && user?.id === userId) {
            fetchPlaylists();
            fetchLimits();
        }
    }, [userId, user]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const data = await getUserPlaylists(userId);
            setPlaylists(data);
        } catch (error) {
            toast.error('Không thể tải danh sách playlist');
        } finally {
            setLoading(false);
        }
    };

    const fetchLimits = async () => {
        try {
            const data = await getUserPlaylistLimits(userId);
            setLimits(data);
        } catch (error) {
            console.error('Error fetching limits:', error);
        }
    };

    const handleCreatePlaylist = async () => {
        if (!playlistName.trim()) {
            toast.error('Vui lòng nhập tên playlist');
            return;
        }

        try {
            const playlistData = {
                name: playlistName,
                description: playlistDescription,
                isPublic: true,
                cover: playlistCover
            };

            await createPlaylist(playlistData);
            toast.success('Tạo playlist thành công!');
            setShowCreateModal(false);
            resetForm();
            fetchPlaylists();
            fetchLimits();
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo playlist');
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa playlist này?')) {
            try {
                await deletePlaylist(playlistId);
                toast.success('Xóa playlist thành công!');
                fetchPlaylists();
                fetchLimits();
            } catch (error) {
                toast.error(error.message || 'Có lỗi xảy ra khi xóa playlist');
            }
        }
    };

    const handleSearchTracks = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            const results = await fetchSearchResults(searchQuery);
            setSearchResults(results.tracks || []);
        } catch (error) {
            toast.error('Không thể tìm kiếm bài hát');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAddTrackToPlaylist = async (trackId) => {
        try {
            await addTrackToPlaylist(selectedPlaylist.id, trackId);
            toast.success('Đã thêm bài hát vào playlist!');
            setShowAddTrackModal(false);
            setSearchResults([]);
            setSearchQuery('');
        } catch (error) {
            toast.error(error.message || 'Vui lòng nâng cấp tài khoản !');
        }
    };

    const handlePlayPlaylist = (playlist) => {
        // Chuyển hướng đến trang chi tiết playlist để phát nhạc
        navigate(`/playlist/${playlist.id}`);
    };

    const resetForm = () => {
        setPlaylistName('');
        setPlaylistDescription('');
        setPlaylistCover(null);
        setPreviewImage(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPlaylistCover(reader.result);
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getRoleDisplay = (role) => {
        switch (role) {
            case 'normal': return { text: '🆓 Normal', color: 'secondary' };
            case 'Vip': return { text: '⭐ VIP', color: 'warning' };
            case 'Premium': return { text: '💎 Premium', color: 'info' };
            case 'admin': return { text: '👑 Admin', color: 'danger' };
            default: return { text: '🆓 Normal', color: 'secondary' };
        }
    };

    const getLimitsDisplay = (limits) => {
        if (!limits) return '';
        
        const isUnlimited = limits.maxPlaylists === 2147483647;
        
        if (isUnlimited) {
            return `Playlist: ${limits.currentPlaylists} (Không giới hạn)`;
        } else {
            return `Playlist: ${limits.currentPlaylists}/${limits.maxPlaylists} — Tối đa ${limits.maxTracksPerPlaylist} bài/playlist`;
        }
    };

    if (user?.id !== userId) {
        return (
            <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                <Alert variant="danger">Bạn không có quyền truy cập trang này.</Alert>
            </Container>
        );
    }

    return (
        <>
            <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                <div className="container">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="text-white fw-bold">📚 Thư viện nhạc</h1>
                            {limits && (
                                <div className="text-light">
                                    <Badge bg={getRoleDisplay(limits.userRole).color} className="me-2">
                                        {getRoleDisplay(limits.userRole).text}
                                    </Badge>
                                    <span className="me-3">
                                        {getLimitsDisplay(limits)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="danger" 
                            onClick={() => setShowCreateModal(true)}
                            disabled={limits && limits.currentPlaylists >= limits.maxPlaylists}
                        >
                            <Plus className="me-2" />
                            Tạo playlist mới
                        </Button>
                    </div>

                    {/* Playlists Grid */}
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <Spinner animation="border" role="status" />
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="text-center text-light py-5">
                            <h4>Chưa có playlist nào</h4>
                            <p>Tạo playlist đầu tiên để bắt đầu!</p>
                        </div>
                    ) : (
                        <Row>
                            {playlists.map((playlist) => (
                                <Col key={playlist.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                    <Card 
                                        className="playlist-card h-100" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                    >
                                        <div className="playlist-image-container">
                                            <Card.Img
                                                variant="top"
                                                src={playlist.imageBase64 || '/images/default-music.jpg'}
                                                className="playlist-image"
                                            />
                                            <div className="playlist-overlay">
                                                <Button
                                                    variant="outline-light"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedPlaylist(playlist);
                                                        setShowAddTrackModal(true);
                                                    }}
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>
                                        </div>
                                        <Card.Body className="d-flex flex-column">
                                            <Card.Title className="text-white mb-2">{playlist.name}</Card.Title>
                                            <Card.Text className="text-muted small mb-2">
                                                {playlist.trackCount} bài hát
                                            </Card.Text>
                                            {playlist.description && (
                                                <Card.Text className="text-muted small mb-3">
                                                    {playlist.description}
                                                </Card.Text>
                                            )}
                                            <div className="mt-auto d-flex gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="flex-fill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/playlist/${playlist.id}`);
                                                    }}
                                                >
                                                    <Pencil className="me-1" />
                                                    Chỉnh sửa
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePlaylist(playlist.id);
                                                    }}
                                                >
                                                    <Trash />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </Container>

            {/* Create Playlist Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>🎵 Tạo playlist mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên playlist *</Form.Label>
                            <Form.Control
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                placeholder="Nhập tên playlist"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={playlistDescription}
                                onChange={(e) => setPlaylistDescription(e.target.value)}
                                placeholder="Mô tả playlist (tùy chọn)"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh bìa</Form.Label>
                            <div className="d-flex align-items-center gap-3">
                                <div className="playlist-cover-preview">
                                    <img
                                        src={previewImage || '/images/default-music.jpg'}
                                        alt="Preview"
                                        className="img-fluid rounded"
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <Form.Text className="text-muted">
                                        Nếu không chọn, sẽ sử dụng ảnh mặc định
                                    </Form.Text>
                                </div>
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleCreatePlaylist}>
                        Tạo playlist
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Track Modal */}
            <Modal show={showAddTrackModal} onHide={() => setShowAddTrackModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Thêm bài hát vào "{selectedPlaylist?.name}"
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <div className="input-group">
                            <Form.Control
                                type="text"
                                placeholder="Tìm kiếm bài hát..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchTracks()}
                            />
                            <Button variant="outline-secondary" onClick={handleSearchTracks}>
                                <Search />
                            </Button>
                        </div>
                    </div>

                    {searchLoading ? (
                        <div className="text-center py-3">
                            <Spinner animation="border" role="status" />
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="search-results">
                            {searchResults.map((track) => (
                                <div key={track.id} className="search-result-item d-flex align-items-center p-2 border-bottom">
                                    <img
                                        src={track.imageBase64 || '/images/default-music.jpg'}
                                        alt={track.title}
                                        className="me-3"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-bold">{track.title}</div>
                                        <div className="text-muted small">{track.artistName || 'Musicresu'}</div>
                                        {!track.isPublic && (
                                            <Badge bg="warning" text="dark" size="sm">VIP</Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleAddTrackToPlaylist(track.id)}
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery && !searchLoading ? (
                        <div className="text-center py-3 text-muted">
                            Không tìm thấy bài hát nào
                        </div>
                    ) : null}
                </Modal.Body>
            </Modal>

            <ToastContainer />
        </>
    );
};

export default LibraryForm; 
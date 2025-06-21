import React, { useEffect, useState } from 'react';
import {
    Card, Button, Form, Row, Col, InputGroup, Spinner, Container, Modal
} from 'react-bootstrap';
import {
    PlayFill, LockFill, CheckCircle, Trash
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import {changeApprove, changePublic, deleteTrack, getAllTracks} from '../services/trackService';
import { useAuth } from "../context/authContext";
import '../styles/AdminTrackList.css';
import {useMusicPlayer} from "../context/musicPlayerContext";
import {useLoginSessionOut} from "../services/loginSessionOut";
import {deleteAllFavorites} from "../services/favoritesService";
import {ToastContainer} from "react-toastify"; // nhớ tạo file này

const AdminTrackList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tracks, setTracks] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { playTrackList } = useMusicPlayer();
    const handleSessionOut = useLoginSessionOut()

    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [trackIdToDelete, setTrackIdToDelete] = useState(null);

    const handleDelete = (trackId) => {
        setTrackIdToDelete(trackId);
        setShowConfirmDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!trackIdToDelete) return;

        try {
            await deleteTrack(trackIdToDelete, handleSessionOut);
            setTracks(prev => prev.filter(t => t.trackId !== trackIdToDelete));
        } catch (err) {
            console.error("Lỗi khi xóa track:", err);
        } finally {
            setShowConfirmDeleteModal(false);
            setTrackIdToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDeleteModal(false);
        setTrackIdToDelete(null);
    };

    useEffect(() => {
        if (!(user?.isLoggedIn && user?.role === 'admin')) {
            navigate('/');
            return;
        }

        const fetchTracks = async () => {
            try {
                const data = await getAllTracks();
                setTracks(data);
            } catch (err) {
                console.error('Lỗi khi tải danh sách nhạc:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [user, navigate]);

    const handleApprove = async (trackId) => {
        await changeApprove(trackId);
        setTracks(prev =>
            prev.map(t =>
                t.trackId === trackId ? { ...t, isApproved: !t.isApproved } : t
            )
        );
    };

    const handleTogglePublic = async (trackId) => {
        await changePublic(trackId);
        setTracks(prev =>
            prev.map(t =>
                t.trackId === trackId ? { ...t, isPublic: !t.isPublic } : t
            )
        );
    };


    const handlePlayMusic = (track) => {
        const playList = [
            {
                id: track.trackId,
                title: track.title,
                subtitle: track.uploaderName !== null ? track.uploaderName : "Musicresu",
                imageUrl: track.imageBase64,
                isPublic: track.isPublic,
            }
        ];
        playTrackList(playList, 0);
    }

    const filteredTracks = tracks.filter(t => {
        const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && t.isApproved) ||
            (filterStatus === 'pending' && !t.isApproved);

        const uploaderName = (t.uploaderName || 'Musicresu').toLowerCase();
        const matchArtist = uploaderName.includes(searchQuery.toLowerCase());

        return matchStatus && matchArtist;
    });

    return (
        <Container fluid className="admin-dark-bg px-5 pt-5">
            <div className="container mt-0">
                <h3>🎵 Quản lý danh sách nhạc</h3>

                {loading ? (
                    <div className="d-flex justify-content-center mt-5">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </Spinner>
                    </div>
                ) : (
                    <>
                        {/* 🔎 Thanh filter */}
                        <Row className="my-3">
                            <Col md={4}>
                                <Form.Select
                                    className="bg-dark text-light border-secondary dark-input"
                                    value={filterStatus}
                                    onChange={e => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="pending">Chưa duyệt</option>
                                </Form.Select>

                            </Col>
                            <Col md={8}>
                                <InputGroup>
                                    <Form.Control
                                        className="bg-dark text-light border-secondary dark-input"
                                        type="text"
                                        placeholder="Tìm theo tên nghệ sĩ..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />

                                </InputGroup>
                            </Col>
                        </Row>

                        {/* 🎵 Danh sách nhạc */}
                        {filteredTracks.length === 0 ? (
                            <p className="text-muted">Không có bài nhạc nào phù hợp.</p>
                        ) : (
                            filteredTracks.map(track => (
                                <Card key={track.trackId} className="mb-3 track-card">
                                    <Row className="g-0 align-items-center">
                                        <Col xs={12} md="auto">
                                            <Card.Img
                                                src={track.imageBase64}
                                                style={{
                                                    width: '240px',
                                                    height: '240px',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Col>

                                        <Col xs={12} md>
                                            <Card.Body className="d-flex flex-column justify-content-between h-100">
                                                <div className="d-flex justify-content-between">
                                                    <div>
                                                        <Card.Title>{track.title}</Card.Title>
                                                        <Card.Text>
                                                            <strong>Thể loại:</strong> {track.genres?.join(', ') || 'Không rõ'}<br />
                                                            <strong>Người đăng:</strong>{' '}
                                                            {track.uploaderId ? (
                                                                <a
                                                                    href={`/personal-profile/${track.uploaderId}`}
                                                                    className="text-info text-decoration-none"
                                                                >
                                                                    {track.uploaderName || 'Musicresu'}
                                                                </a>
                                                            ) : (
                                                                'Musicresu'
                                                            )}<br />
                                                            <strong>Ngày cập nhật:</strong>{' '}
                                                            {track.lastUpdate
                                                                ? new Date(track.lastUpdate).toLocaleDateString()
                                                                : 'Không rõ'}<br />
                                                            {track.uploaderId !== null && (
                                                                <>
                                                                    <strong>Tình trạng:</strong>{' '}
                                                                    {track.isApproved ? (
                                                                        <span className="text-success">Đã duyệt</span>
                                                                        ) : (
                                                                        <span className="text-danger">Chưa duyệt</span>
                                                                        )}<br />
                                                                </>
                                                            )}

                                                            <strong>Hiển thị:</strong>{' '}
                                                            {track.isPublic ? (
                                                                <span className="text-primary">Công khai</span>
                                                            ) : (
                                                                <span className="text-warning">VIP</span>
                                                            )}
                                                        </Card.Text>
                                                    </div>

                                                    {/* Nút Play ở góc phải gần ảnh */}
                                                    <div>
                                                        <Button
                                                            variant="danger"
                                                            className="rounded-circle shadow"
                                                            style={{ width: 50, height: 50 }}
                                                            onClick={() => handlePlayMusic(track)}
                                                        >
                                                            <PlayFill size={25} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Các nút còn lại ở dưới */}
                                                <div className="d-flex justify-content-end gap-2 mt-3 flex-wrap">
                                                    {track.uploaderId == null && (
                                                        <Button
                                                            variant={track.isPublic ? 'secondary' : 'info'}
                                                            onClick={() => handleTogglePublic(track.trackId)}
                                                        >
                                                            {track.isPublic
                                                                ? 'Chuyển sang nhạc VIP'
                                                                : 'Chuyển sang nhạc thường'}
                                                        </Button>
                                                    )}

                                                    {!track.isApproved ? (
                                                        <Button
                                                            variant="success"
                                                            onClick={() => handleApprove(track.trackId)}
                                                        >
                                                            <CheckCircle /> Phê duyệt
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="warning"
                                                            onClick={() => handleApprove(track.trackId)}
                                                        >
                                                            <LockFill /> Khóa
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="danger"
                                                        onClick={() => handleDelete(track.trackId)}
                                                    >
                                                        <Trash /> Xóa
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Col>
                                    </Row>
                                </Card>
                            ))
                        )}
                        <ToastContainer />
                    </>
                )}
            </div>
            <Modal
                show={showConfirmDeleteModal}
                onHide={handleCancelDelete}
                centered
                dialogClassName="custom-modal-overlay"
                backdrop={true}
            >
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title className="text-white">Xác nhận xóa bài nhạc</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    Bạn có chắc chắn muốn xóa bài nhạc này?
                </Modal.Body>
                <Modal.Footer className="bg-dark">
                    <Button variant="secondary" onClick={handleCancelDelete}>Không</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Có</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminTrackList;

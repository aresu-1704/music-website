import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTracksByArtistId } from '../services/trackService';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PlayFill, PersonPlusFill, PersonCheckFill } from 'react-bootstrap-icons';
import { useMusicPlayer } from '../context/musicPlayerContext';
import '../styles/Personal.css';
import {fetchProfileData, getProfileData} from '../services/profileService';
import { useAuth } from '../context/authContext';
import { followUser, unfollowUser, checkFollowing } from '../services/followerService';
import { useLoginSessionOut } from '../services/loginSessionOut';

const PersonalProfileForm = () => {
    const { profileId } = useParams();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playingId, setPlayingId] = useState(null);
    const { playTrackList } = useMusicPlayer();
    const [userInfo, setUserInfo] = useState(null);
    const [role, setRole] = useState(null);
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const handleSessionOut = useLoginSessionOut();
    const [followCount, setFollowCount] = useState(0);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                setLoading(true);
                const data = await getTracksByArtistId(profileId);
                setTracks(data.tracks || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTracks();
    }, [profileId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getProfileData(profileId);
                setUserInfo(data);
                setRole(data.role || null);
            } catch (err) {
                console.error('Lỗi khi fetch profile data:', err);
            }
        };
        fetchUser();
    }, [profileId]);

    // Kiểm tra trạng thái theo dõi khi vào trang
    useEffect(() => {
        const checkFollow = async () => {
            if (user?.id && profileId && user.id !== profileId) {
                try {
                    const res = await checkFollowing(profileId, handleSessionOut);
                    if (res) {
                        setIsFollowing(res.following);
                    }
                } catch (err) {
                    console.error('Lỗi khi kiểm tra trạng thái follow:', err);
                }
            }
        };
        checkFollow();
    }, [profileId, user, handleSessionOut]);

    const handlePlay = (trackId) => {
        const index = tracks.findIndex(t => t.id === trackId);
        playTrackList(tracks, index);
        setPlayingId(trackId);
    };

    const genderToString = (gender) => {
        switch (gender) {
            case 0: return "Nam";
            case 1: return "Nữ";
            case 2: return "Khác";
            case 3: return "Không muốn trả lời";
            default: return "Không xác định";
        }
    };

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(profileId, handleSessionOut);
                setFollowCount(followCount - 1);
                setIsFollowing(false);
            } else {
                await followUser(profileId, handleSessionOut);
                setFollowCount(followCount + 1);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error('Lỗi khi thao tác theo dõi:', err);
            alert('Có lỗi khi thao tác theo dõi!');
        } finally {
            setFollowLoading(false);
        }
    };

    return (
        <Container fluid className="px-5 pt-5 bg-dark min-vh-100">
            {userInfo && (
                <div className="d-flex align-items-center mb-5 p-4 rounded-4 bg-black shadow" style={{ border: '1px solid #ffffff22' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginRight: 48 }}>
                        <img
                            src={userInfo.avatarBase64 || '/images/default-avatar.png'}
                            alt={userInfo.fullname}
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '7px solid #fff3',
                                boxShadow: '0 8px 32px #000a'
                            }}
                        />
                        {/* VIP */}
                        {role === 'Vip' && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#ffc107',
                                    color: '#222',
                                    borderRadius: 10,
                                    padding: '1px 8px 1px 6px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    boxShadow: '0 2px 8px #0005',
                                    zIndex: 2,
                                    border: '1px solid #fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    minWidth: 45,
                                    justifyContent: 'center'
                                }}
                            >
                                <span style={{ fontSize: 12, marginRight: 1 }}>👑</span>
                                <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>VIP</span>
                            </span>
                        )}
                        {/* Premium */}
                        {role === 'Premium' && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'linear-gradient(135deg,#6f42c1,#0dcaf0)',
                                    color: '#fff',
                                    borderRadius: 10,
                                    padding: '1px 10px 1px 6px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    boxShadow: '0 2px 8px #0005',
                                    zIndex: 2,
                                    border: '1px solid #fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    minWidth: 55,
                                    justifyContent: 'center'
                                }}
                            >
                                <span style={{ fontSize: 12, marginRight: 1 }}>💎</span>
                                <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>PREMIUM</span>
                            </span>
                        )}
                        {/* Admin */}
                        {role === 'admin' && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: -12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#ff2d2d',
                                    color: '#111',
                                    borderRadius: 10,
                                    padding: '1px 10px 1px 6px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    boxShadow: '0 2px 8px #0005',
                                    zIndex: 2,
                                    border: '1px solid #fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    minWidth: 55,
                                    justifyContent: 'center'
                                }}
                            >
                                <span style={{ fontSize: 12, marginRight: 1 }}>⚔️</span>
                                <span style={{ fontWeight: 700, letterSpacing: 0.5 }}>ADMIN</span>
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="fw-bold text-white" style={{ fontSize: 46, marginBottom: 24, lineHeight: 1 }}>
                            {userInfo.fullname}
                        </div>
                        <div className="personal-detail">
                            <span className="me-4"><strong>Giới tính:</strong> {genderToString(userInfo.gender)}</span>
                            <span className="me-4"><strong>Ngày sinh:</strong> {userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Không xác định'}</span>
                            <span><strong>Lượt theo dõi:</strong> {followCount}</span>
                        </div>
                        {/* Nút Theo dõi - LUÔN hiển thị nếu không phải chính mình */}
                        {user?.id && user.id !== profileId && (
                            <Button
                                variant={isFollowing ? 'outline-danger' : 'danger'}
                                className="mt-3 px-4 fw-bold d-flex align-items-center gap-2"
                                disabled={followLoading}
                                onClick={handleFollow}
                            >
                                {isFollowing ? (
                                    <>
                                        <PersonCheckFill size={16} />
                                        Hủy theo dõi
                                    </>
                                ) : (
                                    <>
                                        <PersonPlusFill size={16} />
                                        Theo dõi
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Loading cho tracks */}
            {loading && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    <Spinner animation="border" variant="light" />
                </div>
            )}

            {/* Error cho tracks */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Danh sách bài hát - hiển thị ngay cả khi không có bài hát */}
            {!loading && !error && (
                <div className="rounded-4 p-4">
                    {tracks.length === 0 ? (
                        <div className="text-center text-light p-5">
                            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                Người dùng này chưa có đăng tải bài hát nào.
                            </div>
                            <div className="text-muted">
                                Hãy quay lại sau để xem những bài hát mới nhất !
                            </div>
                        </div>
                    ) : (
                        <Row>
                            {tracks.map(track => (
                                <Col xs={12} key={track.id} className="mb-3">
                                    <Card className="d-flex flex-row align-items-center bg-black text-light border-0 shadow rounded-4 p-3 mb-3">
                                        <div
                                            style={{
                                                width: 120,
                                                height: 120,
                                                position: 'relative',
                                                overflow: 'hidden',
                                                borderRadius: 16,
                                                flexShrink: 0
                                            }}
                                            className="me-4"
                                        >
                                            <img
                                                src={track.coverImage || '/images/default-music.jpg'}
                                                alt={track.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {!track.isPublic && (
                                                <span className="position-absolute top-0 end-0 m-1 badge text-dark bg-warning">👑 VIP</span>
                                            )}
                                        </div>

                                        <div className="flex-grow-1">
                                            <div className="fw-bold text-white" style={{ fontSize: '1.1rem', marginBottom: 4 }}>
                                                {track.title}
                                            </div>
                                            <div className="text-light small">
                                                <div><strong>Thể loại:</strong> {track.genres?.length ? track.genres.join(', ') : 'Không xác định'}</div>
                                                <div><strong>Nghệ sĩ:</strong> {track.artistName || 'Musicresu'}</div>
                                                <div><strong>Ngày cập nhật:</strong> {track.updatedAt ? new Date(track.updatedAt).toLocaleDateString('vi-VN') : ''}</div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="danger"
                                            className="rounded-circle ms-4 d-flex align-items-center justify-content-center"
                                            style={{ width: 44, height: 44 }}
                                            onClick={() => handlePlay(track.id)}
                                        >
                                            <PlayFill size={22} />
                                        </Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            )}
        </Container>
    );
};

export default PersonalProfileForm;

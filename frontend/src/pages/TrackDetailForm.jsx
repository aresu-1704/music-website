// src/pages/TrackDetail.jsx
import React, { useEffect, useState } from 'react';
import { getTrackDetail } from '../services/trackService';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Badge, Spinner, Container, Card } from 'react-bootstrap';
import { PlayFill } from 'react-bootstrap-icons';
import { ToastContainer } from 'react-toastify';
import '../styles/TrackDetail.css';
import {useMusicPlayer} from "../context/musicPlayerContext";
import CommentSection from '../components/CommentSection';


export default function TrackDetail() {
    const { trackId } = useParams();
    const navigate = useNavigate();
    const [track, setTrack] = useState(null);
    const { playTrackList } = useMusicPlayer();

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                const data = await getTrackDetail(trackId);
                setTrack(data);
            } catch (error) {
                console.error("Lỗi khi tải track:", error);
            }
        };

        fetchTrack();
    }, [trackId]);

    if (!track) {
        return (
            <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" />
                </div>
            </Container>
        );
    }

    const handlePlayMusic = () => {
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

    return (
        <>
            <Container fluid className="bg-dark text-light py-5" style={{ minHeight: '100vh' }}>
                    <div className="track-detail-container container my-4">
                        <div className="d-flex flex-wrap gap-4">
                            {/* Ảnh bên trái */}
                            <div className="track-image-container position-relative">
                                <img
                                    src={track.imageBase64}
                                    alt={track.title}
                                    className="track-image img-fluid rounded shadow"
                                />
                                {!track.isPublic && (
                                    <Badge
                                        bg="warning"
                                        text="dark"
                                        className="position-absolute top-0 start-0 m-2"
                                    >
                                        👑 VIP
                                    </Badge>
                                )}
                            </div>

                            {/* Thông tin bên phải */}
                            <div className="flex-grow-1 d-flex flex-column justify-content-start">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h2 className="fw-bold">{track.title}</h2>
                                    <Button
                                        variant="danger"
                                        className="rounded-circle shadow"
                                        style={{ width: 50, height: 50 }}
                                        onClick={() => handlePlayMusic()}
                                    >
                                        <PlayFill size={25} />
                                    </Button>
                                </div>

                                <div className="track-info mt-2">
                                    <div className="flex-grow-1">
                                        <p><strong>Thể loại:</strong> {track.genres?.join(", ") || "Không xác định"}</p>
                                        <p><strong>Người đăng:</strong> {track.uploaderId ? (
                                            <span
                                                className="uploader-link"
                                                onClick={() => navigate(`/personal-profile/${track.uploaderId}`)}
                                            >
                                                {track.uploaderName || "Không rõ"}
                                            </span>
                                        ) : "Musicresu"}</p>
                                        <p><strong>Cập nhật:</strong> {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bình luận */}
                        <div className="mt-5">
                            <h5>Bình luận về bài hát</h5>
                            <CommentSection trackId={track.trackId} />
                        </div>

                    </div>
            </Container>
            <ToastContainer />
        </>
    );
}

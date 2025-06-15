import '../../styles/Footer.css';
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeMute, FaVolumeDown, FaVolumeUp, FaHeart, FaRedo } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useMusicPlayer } from '../../context/musicPlayerContext';
import {updateTrackPlayCount} from "../../services/trackService";
import {toast, ToastContainer} from "react-toastify";

const Footer = () => {
    const audioRef = useRef(null);
    const progressRef = useRef(null);

    const {
        playlist,
        currentTrack,
        currentTrackIndex,
        audioUrl,
        isPlaying,
        setIsPlaying,
        playTrackList
    } = useMusicPlayer();

    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isReplay, setIsReplay] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const isReplayRef = useRef(isReplay);

    useEffect(() => {
        isReplayRef.current = isReplay; // cập nhật khi isReplay thay đổi
    }, [isReplay]);

    const handleReplay = () => {
        setIsReplay(prev => !prev);
    };

    const handleLike = () => {
        setIsLiked(prev => !prev);
    };


    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error("Trình duyệt chặn phát audio:", err));
        }
    };

    const playNext = () => {
        if (playlist.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        playTrackList(playlist, nextIndex);
    };

    const playPrev = () => {
        if (playlist.length === 0) return;
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        playTrackList(playlist, prevIndex);

    };

    const handleTimeUpdate = () => {
        const current = audioRef.current?.currentTime || 0;
        const dur = audioRef.current?.duration || 1;
        setCurrentTime(current);
        setDuration(dur);
        setProgress((current / dur) * 100);
    };

    const handleSeek = (e) => {
        if (!progressRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;
        const seekTime = percentage * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
        }
    };

    const handleUpdateTrackPlayCount = async (id) => {
        try {
            await updateTrackPlayCount(id);
        } catch (err) {
            toast.error("Không thể kết nối đến máy chủ hiện tại", { position: "top-center", autoClose: 2000 });
        }
    }

    useEffect(() => {
        if (audioRef.current && audioUrl) {
            audioRef.current.load();
        }
    }, [audioUrl]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return (
        <>
            {currentTrack && audioUrl && (
                <footer className="footer-player">
                    {/* Thông tin nhạc */}
                    <div className="track-info">
                        <img src={currentTrack?.imageUrl || '/images/default-music.jpg'} alt="cover" />
                        <div>
                            <div className="title">{currentTrack?.title || "Chưa chọn bài hát nào"}</div>
                            <div className="subtitle">{currentTrack?.subtitle || ""}</div>
                        </div>
                    </div>

                    {/* Điều khiển + progress */}
                    <div className="center-controls-horizontal">
                        <div className="control-buttons">
                            <button onClick={playPrev}><FaStepBackward /></button>
                            <button onClick={togglePlay} disabled={!audioUrl}>
                                {isPlaying ? <FaPause /> : <FaPlay />}
                            </button>
                            <button onClick={playNext}><FaStepForward /></button>
                        </div>

                        <div className="progress-wrapper" ref={progressRef} onClick={handleSeek}>
                            <div className="progress-time">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Volume và các nút bổ sung */}
                    <div className="volume-section">
                        <button
                            onClick={handleReplay}
                            className="replay-button"
                            style={{ color: isReplay ? "#ff4d4d" : "gray" }}
                        >
                            <FaRedo />
                        </button>
                        {volume === 0 ? <FaVolumeMute /> : volume < 0.5 ? <FaVolumeDown /> : <FaVolumeUp />}
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                        />
                        <button
                            onClick={handleLike}
                            className={`like-button ${isLiked ? "active" : ""}`}
                        >
                            <FaHeart />
                        </button>
                    </div>

                    <audio
                        ref={audioRef}
                        preload="auto"
                        onEnded={() => {
                            if (isReplayRef.current) {
                                if(currentTrack.id != null) {
                                    handleUpdateTrackPlayCount(currentTrack.id);
                                }
                                audioRef.current.currentTime = 0;
                                audioRef.current.play().catch(err => console.error("Không thể replay:", err));
                            } else {
                                setIsPlaying(false);
                                playNext();
                            }
                        }}
                        onTimeUpdate={handleTimeUpdate}
                        onCanPlay={() => {
                            if (isPlaying) {
                                audioRef.current.play().catch(err => console.warn("Autoplay bị chặn:", err));
                            }
                        }}
                    >
                        <source src={audioUrl} type="audio/mpeg" />
                        Trình duyệt không hỗ trợ phát audio.
                    </audio>
                </footer>
            )}
            <ToastContainer />
        </>
    );
};

export default Footer;
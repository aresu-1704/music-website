import { useState, useRef } from "react";
import { FaPlay, FaPause } from "react-icons/fa";

const Footer = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState({
        title: "Chưa có bài hát nào",
        url: "" // TODO: sẽ cập nhật từ API
    });

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    // TODO: Hàm này sau này bạn gọi khi chọn 1 bài hát để cập nhật track
    const changeTrack = (newTrack) => {
        setCurrentTrack(newTrack);
        setIsPlaying(false);

        // Delay play một chút để browser load audio xong
        setTimeout(() => {
            audioRef.current.play();
            setIsPlaying(true);
        }, 200);
    };

    return (
        <footer className="bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center fixed-bottom shadow">
            <div>
                <strong>{currentTrack.title}</strong>
            </div>

            <div>
                <button
                    className="btn btn-outline-light btn-sm"
                    onClick={togglePlay}
                    disabled={!currentTrack.url}
                >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
            </div>

            <audio ref={audioRef} src={currentTrack.url} onEnded={() => setIsPlaying(false)} />
        </footer>
    );
};

export default Footer;

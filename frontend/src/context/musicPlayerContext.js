import { createContext, useContext, useState, useEffect } from "react";
import { getTrackById } from "../services/trackService";

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [audioUrl, setAudioUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    const currentTrack = playlist[currentTrackIndex] || null;

    // ✅ Dùng khi người dùng click "Play"
    const playTrackList = (tracks, index = 0) => {
        setPlaylist(tracks);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    // 🧠 GỌI API để lấy AudioUrl thật
    useEffect(() => {
        const fetchAudioUrl = async () => {
            if (!currentTrack?.id) {
                setAudioUrl('');
                return;
            }

            try {
                const data = await getTrackById(currentTrack.id);
                setAudioUrl(data.audioUrl);
            } catch (error) {
                console.error("Không lấy được AudioUrl:", error);
                setAudioUrl('');
            }
        };

        fetchAudioUrl();
    }, [currentTrack]);

    return (
        <MusicPlayerContext.Provider value={{
            playlist,
            currentTrack,
            currentTrackIndex,
            audioUrl,
            isPlaying,
            setIsPlaying,
            playTrackList
        }}>
            {children}
        </MusicPlayerContext.Provider>
    );
};

export const useMusicPlayer = () => useContext(MusicPlayerContext);

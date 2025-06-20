import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMyFavoriteTracks, toggleFavorites } from '../services/favoritesService';
import { useAuth } from './authContext';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
    const [favoriteTracks, setFavoriteTracks] = useState([]);
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);

    const refreshFavorites = useCallback(async () => {
        setLoading(true);
        const tracks = await getMyFavoriteTracks(logout);
        setFavoriteTracks(tracks || []);
        setLoading(false);
    }, [logout]);

    useEffect(() => {
        refreshFavorites();
        // Lắng nghe sự kiện cập nhật yêu thích từ các trang khác
        const handler = () => refreshFavorites();
        window.addEventListener('favorite-updated', handler);
        return () => window.removeEventListener('favorite-updated', handler);
    }, [refreshFavorites]);

    const favoriteIds = favoriteTracks.map(track => track.id || track.trackId);
    const isFavorite = useCallback((trackId) => favoriteIds.includes(trackId), [favoriteIds]);

    const toggleFavorite = async (trackId) => {
        await toggleFavorites(trackId, logout);
        window.dispatchEvent(new Event('favorite-updated'));
        await refreshFavorites();
    };

    return (
        <FavoriteContext.Provider value={{ favoriteTracks, favoriteIds, isFavorite, toggleFavorite, refreshFavorites, loading }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorite = () => useContext(FavoriteContext); 
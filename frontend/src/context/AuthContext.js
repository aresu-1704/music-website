import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { queryClient } from "./QueryClientContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ isLoggedIn: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const avatarBase64 = localStorage.getItem('avatarBase64');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.sub,
                    avatar: avatarBase64,
                    role: decoded.role,
                    fullname: decoded.fullname,
                    isLoggedIn: true,
                });

            } catch (err) {
                console.error("Token không hợp lệ");
                setUser({ isLoggedIn: false });
            }
        }
    }, []);

    //Hàm log in
    const login = (token, avatarBase64) => {
        queryClient.removeQueries(['profile'])
        localStorage.setItem('token', token);
        localStorage.setItem('avatarBase64', avatarBase64);
        const decoded = jwtDecode(token);
        setUser({
            id: decoded.sub,
            avatar: avatarBase64,
            role: decoded.role,
            fullname: decoded.fullname,
            isLoggedIn: true,
        });
        return user.role;
    };

    // Hàm log out
    const logout = async () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('avatarBase64');
            setUser({isLoggedIn: false});
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5270/api/Auth/logout', {
                method: 'POST',
                headers: {
                    "ContentType": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
        }
        catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('avatarBase64');
            setUser({isLoggedIn: false});
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
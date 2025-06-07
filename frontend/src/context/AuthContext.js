import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ isLoggedIn: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.sub,
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
    const login = (token) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode(token);
        setUser({
            id: decoded.sub,
            role: decoded.role,
            fullname: decoded.fullname,
            isLoggedIn: true,
        });
    };


    // Hàm log out
    const logout = () => {
        localStorage.removeItem('token');
        setUser({ isLoggedIn: false });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

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
                    avt: null,
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
            avt: null,
            role: decoded.role,
            fullname: decoded.fullname,
            isLoggedIn: true,
        });
        return user.role;
    };


    // Hàm log out
    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5270/api/Auth/logout', {
                method: 'POST',
                headers: {
                    "ContentType": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            localStorage.removeItem('token');
            setUser({isLoggedIn: false});
        }
        catch (error) {
            localStorage.removeItem('token');
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

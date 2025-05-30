import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="logo">🎵 Musicresu</div>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/songs">Songs</Link>
                <Link to="/albums">Albums</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/signin">Đăng nhập</Link>
                <Link to="/signup">Đăng ký</Link>
            </div>
        </nav>
    );
}

export default Navbar;

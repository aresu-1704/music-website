import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const location = useLocation();
    const { user, logOut } = useAuth();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-black shadow px-4 py-3 mt-0">
            <div className="container-fluid">
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                    <img src="/images/icon.png" alt="Logo" width="50" height="50" />
                    <span className="text-danger fw-bold fs-3">MUSICRESU</span>
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto gap-3">

                        {/* Luôn hiển thị Home, Songs, Albums */}
                        <li className="nav-item">
                            <Link to="/" className={`nav-link ${isActive("/") ? "active text-danger fw-semibold" : "text-secondary"}`}>Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/songs" className={`nav-link ${isActive("/songs") ? "active text-danger fw-semibold" : "text-secondary"}`}>Songs</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/albums" className={`nav-link ${isActive("/albums") ? "active text-danger fw-semibold" : "text-secondary"}`}>Albums</Link>
                        </li>

                        {/* Nếu chưa đăng nhập */}
                        {!user?.isLoggedIn && (
                            <>
                                <li className="nav-item">
                                    <Link to="/signin" className={`nav-link ${isActive("/signin") ? "active text-danger fw-semibold" : "text-secondary"}`}>Đăng nhập</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/signup" className={`nav-link ${isActive("/signup") ? "active text-danger fw-semibold" : "text-secondary"}`}>Đăng ký</Link>
                                </li>
                            </>
                        )}

                        {/* Nếu đã đăng nhập */}
                        {user?.isLoggedIn && (
                            <>
                                {user.role === 'admin' && (
                                    <li className="nav-item">
                                        <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active text-danger fw-semibold" : "text-secondary"}`}>Quản trị</Link>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <span className="nav-link text-danger">Xin chào, {user.fullname}</span>
                                </li>
                                {/*<li className="nav-item">*/}
                                {/*    <button onClick={logOut} className="btn btn-outline-danger">Đăng xuất</button>*/}
                                {/*</li>*/}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

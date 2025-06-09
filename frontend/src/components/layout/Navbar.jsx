import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import React, { useState } from "react";
import { Modal, Button, Dropdown } from "react-bootstrap";
import { FaUser, FaShieldAlt, FaSignOutAlt, FaCogs, FaHeart, FaEye } from 'react-icons/fa';
import '../../styles/Navbar.css'

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showConfirmSigninModal, setShowConfirmSigninModal] = useState(false);

    const handleLogoutClick = () => setShowLogoutModal(true);
    const handleClose = () => setShowLogoutModal(false);
    const handleConfirmLogout = () => {
        logout();
        setShowLogoutModal(false);
        navigate('/');
    };

    const handleConfirmSigninClick = () => setShowConfirmSigninModal(true);
    const handleSigninClose = () => setShowConfirmSigninModal(false);
    const handleConfirmSignin = () => {
        navigate('/signin');
        setShowConfirmSigninModal(false);
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
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
                    {!user?.isLoggedIn || user.role !== "admin" ? (
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav mx-auto gap-3 d-flex align-items-center">
                                <li className="nav-item">
                                    <Link to="/" className={`nav-link ${isActive("/") ? "active text-danger fw-semibold" : "text-secondary"}`}>Trang chủ</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/artist" className={`nav-link ${isActive("/artist") ? "active text-danger fw-semibold" : "text-secondary"}`}>Nghệ sĩ</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/albums" className={`nav-link ${isActive("/albums") ? "active text-danger fw-semibold" : "text-secondary"}`}>Albums</Link>
                                </li>
                                <li className="nav-item">
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="d-flex align-items-center"
                                        style={{ width: '500px', position: 'relative' }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="gray"
                                            className="bi bi-search"
                                            viewBox="0 0 16 16"
                                            style={{
                                                position: 'absolute',
                                                left: '10px',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zm-5.242 1.06a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                                        </svg>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tìm kiếm..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                borderRadius: '20px',
                                                paddingLeft: '35px',
                                                border: '1px solid #ccc',
                                                outline: 'none',
                                                transition: 'border-color 0.3s',
                                            }}
                                            onFocus={(e) => (e.target.style.borderColor = '#dc3545')}
                                            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
                                        />
                                    </form>
                                </li>

                                <li className="nav-item">
                                    {user?.isLoggedIn ? (
                                        <Link
                                            to="/library"
                                            className={`nav-link ${isActive("/library") ? "active text-danger fw-semibold" : "text-secondary"}`}
                                        >
                                            Thư viện
                                        </Link>
                                    ) : (
                                        <span
                                            className="nav-link text-secondary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleConfirmSigninClick}
                                        >
                                    Thư viện
                                </span>
                                    )}
                                </li>


                                <li className="nav-item">
                                    {user?.isLoggedIn ? (
                                        <Link
                                            to="/histories"
                                            className={`nav-link ${isActive("/histories") ? "active text-danger fw-semibold" : "text-secondary"}`}
                                        >
                                            Lịch sử nghe
                                        </Link>
                                    ) : (
                                        <span
                                            className="nav-link text-secondary"
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleConfirmSigninClick}
                                        >
                                    Lịch sử nghe
                                </span>
                                    )}
                                </li>



                                {/* Nếu chưa đăng nhập */}
                                {!user?.isLoggedIn && (
                                    <>
                                        <li className="nav-item">
                                            <Link to="/signin" className={`nav-link ${isActive("/signin") ? "active text-danger fw-semibold" : "text-secondary"}`}>Đăng nhập</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/signup" className={`btn btn-danger fw-semibold`}>
                                                Đăng ký
                                            </Link>
                                        </li>

                                    </>
                                )}

                                {/* Nếu đã đăng nhập */}
                                {/* Dropdown cho người dùng đã đăng nhập */}
                                {user?.isLoggedIn && (
                                    <li className="nav-item dropdown">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="link" id="dropdown-user" className="nav-link text-danger d-flex align-items-center gap-2">
                                                <div
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "50%",
                                                        overflow: "hidden",
                                                        backgroundColor: "#ccc",
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <img
                                                        src={user.avt ? user.avt : "/images/default-avatar.png"}
                                                        alt="Avatar"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            display: "block"
                                                        }}
                                                    />
                                                </div>
                                                Xin chào, {user.fullname}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu className="custom-dropdown-menu">
                                                <Dropdown.Item as={Link} to={`/profile/${user.id}`}>
                                                    <FaUser className="me-2" /> Thông tin cá nhân
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/upgrade">
                                                    <FaCogs className="me-2" /> Nâng cấp tài khoản
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/likes">
                                                    <FaHeart className="me-2" /> Đã thích
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/follow">
                                                    <FaEye className="me-2" /> Đang theo dõi
                                                </Dropdown.Item>
                                                <Dropdown.Item as={Link} to="/policy">
                                                    <FaShieldAlt className="me-2" /> Chính sách
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={handleLogoutClick}>
                                                    <FaSignOutAlt className="me-2" /> Đăng xuất
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </li>
                                )}
                            </ul>
                        </div>
                    ) : (
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav mx-auto gap-3 d-flex align-items-center">
                                <li className="nav-item">
                                    <Link to="/statistic" className={`nav-link ${isActive("/statistic") ? "active text-danger fw-semibold" : "text-secondary"}`}>Số liệu thống kê</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/account-mn" className={`nav-link ${isActive("/account-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Tài khoản người dùng</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/artist-mn" className={`nav-link ${isActive("/artist-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Quản lý nghệ sĩ</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/albums-mn" className={`nav-link ${isActive("/albums-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Albums</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/report-mn" className={`nav-link ${isActive("/report-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Báo cáo vi phạm</Link>
                                </li>

                                <li className="nav-item dropdown">
                                    <Dropdown align="end">
                                        <Dropdown.Toggle variant="link" id="dropdown-user" className="nav-link text-danger d-flex align-items-center gap-2">
                                            <div
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "50%",
                                                    overflow: "hidden",
                                                    backgroundColor: "#ccc",
                                                    flexShrink: 0
                                                }}
                                            >
                                                <img
                                                    src={user.avt ? user.avt : "/images/default-avatar.png"}
                                                    alt="Avatar"
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        display: "block"
                                                    }}
                                                />
                                            </div>
                                            Xin chào, {user.fullname}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="custom-dropdown-menu">
                                            <Dropdown.Item as={Link} to={`/profile/${user.id}`}>
                                                <FaUser className="me-2" /> Thông tin cá nhân
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/upgrade">
                                                <FaCogs className="me-2" /> Nâng cấp tài khoản
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/likes">
                                                <FaHeart className="me-2" /> Đã thích
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/follow">
                                                <FaEye className="me-2" /> Đang theo dõi
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/policy">
                                                <FaShieldAlt className="me-2" /> Chính sách
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={handleLogoutClick}>
                                                <FaSignOutAlt className="me-2" /> Đăng xuất
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>


            <Modal show={showLogoutModal} onHide={handleClose} centered dialogClassName={"custom-modal-overlay"} backdrop={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận đăng xuất</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có chắc muốn đăng xuất không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Hủy</Button>
                    <Button variant="danger" onClick={handleConfirmLogout}>Đăng xuất</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmSigninModal} onHide={handleSigninClose} centered dialogClassName={"custom-modal-overlay"} backdrop={true}>
                <Modal.Header closeButton>
                    <Modal.Title>Cần phải đăng nhập</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bạn có muốn đăng nhập không?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleSigninClose}>Hủy</Button>
                    <Button variant="danger" onClick={handleConfirmSignin}>Đồng ý</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Navbar;

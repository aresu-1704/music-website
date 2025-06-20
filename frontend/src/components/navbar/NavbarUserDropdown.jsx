// components/navbar/NavbarUserDropdown.jsx
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { FaUser, FaShieldAlt, FaSignOutAlt, FaCogs, FaHeart, FaEye } from 'react-icons/fa';

const NavbarUserDropdown = ({ user, onLogout }) => (
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
                    src={user.avatar || "/images/default-avatar.png"}
                    alt="Avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>
            Xin chào, {user.fullname}
        </Dropdown.Toggle>

        <Dropdown.Menu className="custom-dropdown-menu">
            <Dropdown.Item as={Link} to={`/profile/${user.id}`}>
                <FaUser className="me-2" /> Thông tin cá nhân
            </Dropdown.Item>
            {user.role !== "admin" && (
                <>
                    <Dropdown.Item as={Link} to={`/upgrade/${user.id}`}>
                        <FaCogs className="me-2" /> Nâng cấp tài khoản
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/likes">
                        <FaHeart className="me-2" /> Đã thích
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/follow">
                        <FaEye className="me-2" /> Đang theo dõi
                    </Dropdown.Item>
                </>
            )}
            <Dropdown.Item as={Link} to="/policy">
                <FaShieldAlt className="me-2" /> Chính sách
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onLogout}>
                <FaSignOutAlt className="me-2" /> Đăng xuất
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

export default NavbarUserDropdown;

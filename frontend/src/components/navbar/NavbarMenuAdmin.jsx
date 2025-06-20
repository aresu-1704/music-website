// components/navbar/NavbarMenuAdmin.jsx
import React from "react";
import { Link } from "react-router-dom";

const NavbarMenuAdmin = ({ isActive }) => (
    <>
        <li className="nav-item">
            <Link to="/statistic" className={`nav-link ${isActive("/statistic") ? "active text-danger fw-semibold" : "text-secondary"}`}>Số liệu thống kê</Link>
        </li>
        <li className="nav-item">
            <Link to="/account-mn" className={`nav-link ${isActive("/account-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Tài khoản người dùng</Link>
        </li>
        <li className="nav-item">
            <Link to="/track-management" className={`nav-link ${isActive("/track-management") ? "active text-danger fw-semibold" : "text-secondary"}`}>Quản lý nhạc</Link>
        </li>
        <li className="nav-item">
            <Link to="/report-mn" className={`nav-link ${isActive("/report-mn") ? "active text-danger fw-semibold" : "text-secondary"}`}>Báo cáo vi phạm</Link>
        </li>
        <li className="nav-item">
            <Link to="/upload" className={`nav-link ${isActive("/upload") ? "active text-danger fw-semibold" : "text-secondary"}`}>Tải lên nhạc mới</Link>
        </li>
    </>
);

export default NavbarMenuAdmin;

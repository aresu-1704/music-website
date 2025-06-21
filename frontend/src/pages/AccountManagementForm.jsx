import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { getAllUsers, updateUserStatus, updateUserRole, deleteUserFromDatabase } from '../services/profileService';
import { FaSearch, FaFilter, FaLock, FaUnlock, FaUserShield, FaTrash } from 'react-icons/fa';
import '../styles/AccountManagement.css';

const AccountManagementForm = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Hidden users state
    const [hiddenUsers, setHiddenUsers] = useState(() => {
        const saved = localStorage.getItem('hiddenUsers');
        return saved ? JSON.parse(saved) : [];
    });

    // Show hidden users state
    const [showHiddenUsers, setShowHiddenUsers] = useState(false);

    useEffect(() => {
        if (user?.role !== 'admin') {
            window.location.href = '/';
            return;
        }
        fetchUsers();
    }, [user]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, selectedRole]);

    // Save hidden users to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('hiddenUsers', JSON.stringify(hiddenUsers));
    }, [hiddenUsers]);

    const fetchUsersWithHiddenFilter = async (hiddenUsersToFilter) => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            // Filter out hidden users
            const filteredResponse = response.filter(user => !hiddenUsersToFilter.includes(user.userId));
            setUsers(filteredResponse);
            setFilteredUsers(filteredResponse);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        await fetchUsersWithHiddenFilter(hiddenUsers);
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by role
        if (selectedRole !== 'all') {
            filtered = filtered.filter(user => user.role === selectedRole);
        }

        setFilteredUsers(filtered);
    };

    const showConfirmation = (action, user) => {
        setConfirmAction(action);
        setSelectedUser(user);
        setShowConfirmModal(true);
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (confirmAction === 'deletePermanent') {
                if (selectedUser.userId === 'all') {
                    // Xóa toàn bộ user bị ẩn khỏi database
                    for (const userId of hiddenUsers) {
                        await deleteUserFromDatabase(userId);
                    }
                    setHiddenUsers([]);
                    localStorage.removeItem('hiddenUsers');
                    alert('Đã xóa hoàn toàn tất cả tài khoản bị ẩn khỏi database!');
                } else {
                    await deleteUserFromDatabase(selectedUser.userId);
                    setHiddenUsers(prev => prev.filter(id => id !== selectedUser.userId));
                    setUsers(prevUsers => prevUsers.filter(user => user.userId !== selectedUser.userId));
                    alert('Đã xóa hoàn toàn tài khoản khỏi database!');
                }
            } else {
                switch (confirmAction) {
                    case 'status':
                        const newStatus = !selectedUser.status;
                        await updateUserStatus(selectedUser.userId, newStatus);
                        
                        // Update local state
                        setUsers(prevUsers => 
                            prevUsers.map(user => 
                                user.userId === selectedUser.userId 
                                    ? { ...user, status: newStatus }
                                    : user
                            )
                        );
                        break;

                    case 'role':
                        const newRole = selectedUser.role === 'admin' ? 'normal' : 'admin';
                        await updateUserRole(selectedUser.userId, newRole);
                        
                        // Update local state
                        setUsers(prevUsers => 
                            prevUsers.map(user => 
                                user.userId === selectedUser.userId 
                                    ? { ...user, role: newRole }
                                    : user
                            )
                        );
                        break;

                    case 'delete':
                        // Add user to hidden list
                        setHiddenUsers(prev => [...prev, selectedUser.userId]);
                        // Remove from current display
                        setUsers(prevUsers => 
                            prevUsers.filter(user => user.userId !== selectedUser.userId)
                        );
                        // Update filtered users
                        setFilteredUsers(prevFiltered => 
                            prevFiltered.filter(user => user.userId !== selectedUser.userId)
                        );
                        break;

                    default:
                        break;
                }
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
            setConfirmAction(null);
            setSelectedUser(null);
        }
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedUser(null);
    };

    const restoreHiddenUser = async (userId) => {
        const updatedHiddenUsers = hiddenUsers.filter(id => id !== userId);
        setHiddenUsers(updatedHiddenUsers);
        // Gọi API để load lại dữ liệu
        await fetchUsersWithHiddenFilter(updatedHiddenUsers);
        // Reload trang hiện tại để đảm bảo dữ liệu được cập nhật
        window.location.reload();
    };

    const clearAllHiddenUsers = async () => {
        setHiddenUsers([]);
        // Gọi API để load lại dữ liệu
        await fetchUsersWithHiddenFilter([]);
        // Reload trang hiện tại để đảm bảo dữ liệu được cập nhật
        window.location.reload();
    };

    const getConfirmMessage = () => {
        if (!selectedUser || !confirmAction) return '';

        switch (confirmAction) {
            case 'status':
                return `Bạn có chắc chắn muốn ${selectedUser.status ? 'khóa' : 'mở khóa'} tài khoản "${selectedUser.name}"?`;
            case 'role':
                return `Bạn có chắc chắn muốn cấp quyền ${selectedUser.role === 'admin' ? 'normal' : 'admin'} cho tài khoản "${selectedUser.name}"?`;
            case 'delete':
                return `Bạn có chắc chắn muốn xóa tài khoản "${selectedUser.name}" khỏi giao diện quản trị? (Tài khoản sẽ bị ẩn khỏi tất cả admin và chỉ hiện lại khi xóa cache)`;
            case 'deletePermanent':
                return `Bạn có chắc chắn muốn XÓA HOÀN TOÀN ${selectedUser.name} khỏi database? Hành động này KHÔNG THỂ HOÀN TÁC!`;
            default:
                return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getGenderText = (gender) => {
        switch (gender) {
            case 0: return 'Nam';
            case 1: return 'Nữ';
            case 2: return 'Khác';
            default: return 'Không xác định';
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'Vip': return 'VIP';
            case 'Premium': return 'Premium';
            case 'normal': return 'Normal';
            default: return role;
        }
    };

    const getRoleClass = (role) => {
        switch (role) {
            case 'admin': return 'admin';
            case 'Vip': return 'vip';
            case 'Premium': return 'premium';
            case 'normal': return 'normal';
            default: return 'normal';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#f44336'; // Đỏ
            case 'Vip': return '#ffc107'; // Vàng
            case 'Premium': return '#2196f3'; // Xanh nước
            case 'normal': return '#9e9e9e'; // Xám
            default: return '#9e9e9e';
        }
    };

    const getRoleBackgroundColor = (role) => {
        switch (role) {
            case 'admin': return 'rgba(244, 67, 54, 0.2)'; // Đỏ nhạt
            case 'Vip': return 'rgba(255, 193, 7, 0.2)'; // Vàng nhạt
            case 'Premium': return 'rgba(33, 150, 243, 0.2)'; // Xanh nhạt
            case 'normal': return 'rgba(158, 158, 158, 0.2)'; // Xám nhạt
            default: return 'rgba(158, 158, 158, 0.2)';
        }
    };

    if (user?.role !== 'admin') {
        return <div>Bạn không có quyền truy cập trang này</div>;
    }

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="account-management-container">
            <div className="account-management-header">
                <h1>Quản Lý Tài Khoản</h1>
                <p>Quản lý và theo dõi tất cả tài khoản người dùng</p>
            </div>

            <div className="account-management-controls">
                <div className="search-section">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-section">
                    <div className="filter-box">
                        <FaFilter className="filter-icon" />
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="all">Tất cả tài khoản</option>
                            <option value="normal">Tài khoản Normal</option>
                            <option value="Premium">Tài khoản Premium</option>
                            <option value="Vip">Tài khoản VIP</option>
                            <option value="admin">Tài khoản Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="account-management-stats">
                <div className="stat-card">
                    <h3>Tổng số tài khoản</h3>
                    <p>{filteredUsers.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tài khoản hoạt động</h3>
                    <p>{filteredUsers.filter(user => user.status).length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tài khoản admin</h3>
                    <p>{filteredUsers.filter(user => user.role === 'admin').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tài khoản VIP</h3>
                    <p>{filteredUsers.filter(user => user.role === 'Vip').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tài khoản Premium</h3>
                    <p>{filteredUsers.filter(user => user.role === 'Premium').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tài khoản bị ẩn</h3>
                    <p>{hiddenUsers.length}</p>
                </div>
            </div>

            {hiddenUsers.length > 0 && (
                <div className="hidden-users-section">
                    <div className="hidden-users-header">
                        <h3>Tài khoản bị ẩn ({hiddenUsers.length})</h3>
                        <div className="hidden-users-actions">
                            <button 
                                className="btn-delete-permanent"
                                onClick={() => showConfirmation('deletePermanent', { userId: 'all', name: 'tất cả tài khoản bị ẩn' })}
                            >
                                Xóa hoàn toàn khỏi database
                            </button>
                            <button 
                                className="btn-restore-all"
                                onClick={clearAllHiddenUsers}
                            >
                                Khôi phục tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Avatar</th>
                            <th>Thông tin cơ bản</th>
                            <th>Liên hệ</th>
                            <th>Ngày sinh</th>
                            <th>Giới tính</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Đăng nhập cuối</th>
                            <th>Quyền</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.userId} className={!user.status ? 'locked-user' : ''}>
                                <td>
                                    <div className="user-avatar">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="Avatar" />
                                        ) : (
                                            <div className="default-avatar">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="user-info">
                                        <div className="user-name">{user.name}</div>
                                        <div className="user-username">@{user.username}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info">
                                        <div className="user-email">{user.email}</div>
                                        <div className="user-phone">{user.phoneNumber}</div>
                                    </div>
                                </td>
                                <td>{formatDate(user.dateOfBirth)}</td>
                                <td>{getGenderText(user.gender)}</td>
                                <td>
                                    <span className={`status-badge ${user.status ? 'active' : 'locked'}`}>
                                        {user.status ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td>{formatDate(user.createdAt)}</td>
                                <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Chưa đăng nhập'}</td>
                                <td>
                                    <span 
                                        className="role-badge" 
                                        style={{ 
                                            backgroundColor: getRoleBackgroundColor(user.role), 
                                            color: getRoleColor(user.role),
                                            border: `1px solid ${getRoleColor(user.role)}`
                                        }}
                                    >
                                        {getRoleText(user.role)}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className={`role-btn ${user.role === 'admin' ? 'admin-active' : 'admin-inactive'}`}
                                            onClick={() => showConfirmation('role', user)}
                                            disabled={user.role === 'admin'}
                                            title={user.role === 'admin' ? 'Đã là admin' : 'Cấp quyền admin'}
                                        >
                                            <FaUserShield />
                                            {user.role === 'admin' ? 'Đã là Admin' : 'Cấp Admin'}
                                        </button>
                                        
                                        <button
                                            className={`status-btn ${user.status ? 'lock-btn' : 'unlock-btn'}`}
                                            onClick={() => showConfirmation('status', user)}
                                            title={user.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                        >
                                            {user.status ? <FaLock /> : <FaUnlock />}
                                            {user.status ? 'Khóa TK' : 'Mở khóa'}
                                        </button>
                                        
                                        <button
                                            className="delete-btn"
                                            onClick={() => showConfirmation('delete', user)}
                                            title="Xóa tài khoản khỏi giao diện quản trị"
                                        >
                                            <FaTrash />
                                            Xóa TK
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Xác nhận thao tác</h3>
                        </div>
                        <div className="modal-body">
                            <p>{getConfirmMessage()}</p>
                            {isLoading && (
                                <div className="loading-indicator">
                                    <div className="spinner"></div>
                                    <p>Đang xử lý...</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-cancel" 
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button 
                                className="btn-confirm" 
                                onClick={handleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountManagementForm; 
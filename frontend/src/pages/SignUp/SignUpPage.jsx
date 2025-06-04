import React, { useState } from 'react';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';

export default function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Mật khẩu và xác nhận mật khẩu không khớp!');
            return;
        }
        alert(`Đăng ký với họ tên: ${fullName}, SĐT: ${phone}, Email: ${email}`);
    };

    const handleGoogleSignIn = () => {
        alert('Đăng ký bằng Google');
    };

    const handleFacebookSignIn = () => {
        alert('Đăng ký bằng Facebook');
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 pt-5 py-5">
            <div
                className="card p-4 shadow"
                style={{
                    width: 400,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '0.5rem'
                }}
            >
                <div className="d-flex flex-column align-items-center">
                    <img src="/images/icon.png" alt="Logo" width="150" height="150" />
                    <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>Đăng ký</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Họ và tên</label>
                        <input
                            type="text"
                            className="form-control"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Nhập họ và tên"
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Số điện thoại</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="Nhập số điện thoại"
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ngày sinh</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Nhập email"
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Nhập mật khẩu"
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Nhập lại mật khẩu"
                            style={{ backgroundColor: 'white', color: 'black' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-100 mb-3">Đăng ký</button>
                </form>

                <div>
                    <div className="text-center mb-3" style={{ color: 'white' }}>Hoặc đăng ký bằng</div>

                    <button onClick={handleGoogleSignIn} className="btn btn-outline-danger w-100 mb-2 position-relative" style={{ paddingLeft: '2.5rem' }}>
                        <Google size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'red' }} />
                        <span className="d-block text-center w-100">Đăng ký với Google</span>
                    </button>

                    <button onClick={handleFacebookSignIn} className="btn btn-outline-primary w-100 mb-2 position-relative" style={{ paddingLeft: '2.5rem' }}>
                        <Facebook size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#0d6efd' }} />
                        <span className="d-block text-center w-100">Đăng ký với Facebook</span>
                    </button>

                    <button onClick={() => alert('Đăng ký bằng Apple')} className="btn btn-outline-secondary w-100 position-relative" style={{ paddingLeft: '2.5rem' }}>
                        <Apple size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'gray' }} />
                        <span className="d-block text-center w-100">Đăng ký với Apple</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

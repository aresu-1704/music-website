import React, { useState } from 'react';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Đăng nhập với email: ${email} và password: ${password}`);
    };

    const handleGoogleSignIn = () => {
        alert('Đăng nhập bằng Google');
        // Thêm logic đăng nhập Google ở đây
    };

    const handleFacebookSignIn = () => {
        alert('Đăng nhập bằng Facebook');
        // Thêm logic đăng nhập Facebook ở đây
    };

    return (
        <div className="d-flex justify-content-center align-items-center pt-5">
            <div
                className="card p-4 shadow"
                style={{
                    width: 400,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '0.5rem'
                }}
            >
                <h2 className="mb-4 text-center" style={{ color: 'red' }}>Đăng nhập</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label" style={{ color: 'white' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="Nhập email"
                            style={{ backgroundColor: 'white', color: 'black', borderColor: '#555' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label" style={{ color: 'white' }}>Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="Nhập mật khẩu"
                            style={{ backgroundColor: 'white', color: 'black', borderColor: '#555' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-danger w-100 mb-3">Đăng nhập</button>
                </form>

                <div>
                    <div className="text-center mb-3" style={{ color: 'white' }}>Hoặc đăng nhập với</div>

                    <button onClick={handleGoogleSignIn} className="btn btn-outline-danger w-100 mb-2 position-relative" style={{ paddingLeft: '2.5rem' }}>
                        <Google size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'red' }} />
                        <span className="d-block text-center w-100">Đăng nhập với Google</span>
                    </button>

                    <button onClick={handleFacebookSignIn} className="btn btn-outline-primary w-100 mb-2 position-relative" style={{ paddingLeft: '2.5rem' }}>
                        <Facebook size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#0d6efd' }} />
                        <span className="d-block text-center w-100">Đăng nhập với Facebook</span>
                    </button>

                    <button
                        onClick={() => alert('Đăng nhập bằng Apple')}
                        className="btn btn-outline-secondary w-100 position-relative"
                        style={{ paddingLeft: '2.5rem' }}
                    >
                        <Apple
                            size={20}
                            style={{
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'gray'  // đổi màu icon sang xám
                            }}
                        />
                        <span className="d-block text-center w-100">Đăng nhập với Apple</span>
                    </button>

                </div>
            </div>
        </div>
    );
}

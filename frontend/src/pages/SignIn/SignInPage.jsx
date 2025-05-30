import React, { useState } from 'react';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Đăng nhập với email: ${email} và password: ${password}`);
        // Ở đây bạn có thể gọi API đăng nhập
    };

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Email:</label><br />
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Mật khẩu:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </div>
                <button type="submit" style={{ padding: 10, width: '100%' }}>Đăng nhập</button>
            </form>
        </div>
    );
}

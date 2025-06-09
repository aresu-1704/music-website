import React, { useState } from 'react';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';
import {toast, ToastContainer} from "react-toastify";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import { Spinner } from 'react-bootstrap';

export default function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();

    const navigate = useNavigate();

    const validate = () => {
        let isValid = true;

        if (!username) {
            setUsernameError('Tên đăng nhập không được để trống');
            isValid = false;
        }
        else {
            setUsernameError('');
        }

        if (!password) {
            setPasswordError('Mật khẩu không được để trống');
            isValid = false;
        } else if (password.length < 8) {
            setPasswordError('Mật khẩu phải có ít nhất 8 ký tự');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (validate()) {
            setIsSubmitting(true);

            try {
                const response = await fetch('http://localhost:5270/api/Auth/login', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    })
                })

                if (response.ok) {
                    let result = await response.json();
                    let token = result['token'];
                    toast.success("Đăng nhập thành công", {
                        position: "top-center",
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored",
                    });

                    setTimeout(() => {
                        let role = login(token);

                        if (role === "admin") {
                            navigate('/statistic')
                        }
                        else {
                            navigate('/')
                        }
                    }, 2000)
                }
                else if (response.status === 401) {
                    let result = await response.json();
                    let message = result['message'];
                    if (message === "Sai tên đăng nhập hoặc mật khẩu") {
                        toast.error("Sai tên đăng nhập hoặc mật khẩu !", {
                            position: "top-center",
                            autoClose: 2000,
                            closeOnClick: true,
                            pauseOnHover: false,
                            theme: "colored",
                        });
                    }
                }
                else if (response.status === 403) {
                    toast.error("Tài khoản của bạn đã bị khóa !", {
                        position: "top-center",
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored",
                    });
                }

                else if (response.status === 500) {
                    toast.error("Máy chủ đang bảo trì, vui lòng thử lại sau ít phút !", {
                        position: "top-center",
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored",
                    });
                }
            }
            catch (error) {
                if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                    // Đây là lỗi khi không thể kết nối đến server (network error)
                    toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc server!", {
                        position: "top-center",
                        autoClose: 3000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored",
                    });
                } else {
                    toast.error("Lỗi không xác định, vui lòng thử lại sau !", {
                        position: "top-center",
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored",
                    });
                }
            }
            finally {
                setTimeout(() => {
                    setIsSubmitting(false);
                }, 2500)
            }
        }
    };

    const handleGoogleSignIn = () => {
        alert('Đăng nhập bằng Google');
    };

    const handleFacebookSignIn = () => {
        alert('Đăng nhập bằng Facebook');
    };

    const handleAppleSignIn = () => {
        alert('Đăng nhập Apple');
    }

    return (
        <>
            {isSubmitting && (
                <>
                    <div
                        className="loading-overlay"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Spinner animation="border" variant="light" style={{}} />
                    </div>
                    <ToastContainer />
                </>
            )}

            {!isSubmitting && (
                <>
                    <div className="d-flex justify-content-center align-items-center pt-5">
                        <div
                            className="card p-4 shadow"
                            style={{
                                width: 500,
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: '0.5rem'
                            }}
                        >
                            <div className="d-flex flex-column align-items-center">
                                <img src="/images/icon.png" alt="Logo" width="120" height="120" />
                                <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>Đăng nhập</h2>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label" style={{ color: 'white' }}>Tên đăng nhập</label>
                                    <input
                                        type="username"
                                        id="username"
                                        className={`form-control ${usernameError ? 'is-invalid' : ''}`}
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="Nhập tên đăng nhập"
                                        style={{ backgroundColor: 'white', color: 'black', borderColor: '#555' }}
                                    />
                                    {usernameError && <div className="invalid-feedback">{usernameError}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label" style={{ color: 'white' }}>Mật khẩu</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu"
                                        style={{ backgroundColor: 'white', color: 'black', borderColor: '#555' }}
                                    />
                                    {passwordError && <div className="invalid-feedback">{passwordError}</div>}
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
                                    onClick={handleAppleSignIn}
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
                                            color: 'gray'
                                        }}
                                    />
                                    <span className="d-block text-center w-100">Đăng nhập với Apple</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <ToastContainer/>
                </>
            )}
        </>
    );
}

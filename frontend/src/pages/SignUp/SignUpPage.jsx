import React, { useState } from 'react';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {Spinner} from "react-bootstrap";

export default function SignUpPage() {
    // Các state input như bạn có
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dobDay, setDobDay] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobYear, setDobYear] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Thêm state lưu lỗi
    const [errors, setErrors] = useState({});

    // Mảng ngày tháng năm bạn giữ nguyên
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting === true){
            return;
        }

        setIsSubmitting(true);

        // Reset lỗi trước khi kiểm tra
        let newErrors = {};

        if (password.length < 8) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự!';
        }

        if (!confirmPassword) {
            newErrors.confirmPasswordNull = "Vui lòng xác nhận mật khẩu!"
        }
        else {
            if (password !== confirmPassword) {
                newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp!';
            }
        }


        if (!dobDay || !dobMonth || !dobYear) {
            newErrors.dob = 'Vui lòng chọn đầy đủ ngày sinh!';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = 'Email không đúng định dạng!';
        }

        // Ví dụ bạn đang kiểm tra số điện thoại 10 số
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Số điện thoại không đúng định dạng!';
        }

        if (!gender) {
            newErrors.gender = 'Vui lòng chọn giới tính!';
        }

        if (!username.trim()) {
            newErrors.username = 'Tên đăng nhập không được để trống!';
        }

        if (!fullName.trim()) {
            newErrors.fullName = 'Họ và tên không được để trống!';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        var genderNumber;
        switch (gender) {
            case 'Nam':
                genderNumber = 1;
                break;
            case 'Nữ':
                genderNumber = 2;
                break;
            case 'Khác':
                genderNumber = 3;
                break;
            case 'Không muốn trả lời':
                genderNumber = 4;
                break;
            default:
                break;
        }

        const dob = `${dobYear}-${dobMonth.toString().padStart(2, '0')}-${dobDay
            .toString()
            .padStart(2, '0')}`;

        try {
            const response = await fetch('http://localhost:5270/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    fullname: fullName,
                    email: email,
                    password: password,
                    phoneNumber: phone,
                    dateOfBirth: dob,
                    gender: genderNumber,
                }),
            });

            if (response.ok) {
                let result = await response.json();
                let message = result['message'];

                if (message === "Email đã tồn tại.") {
                    toast.error("Đăng ký thất bại. Email đã tồn tại !", {
                        position: 'top-center',
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored"
                    });
                }

                else if (message === "Tên đăng nhập đã tồn tại.") {
                    toast.error("Đăng ký thất bại. Tên đăng nhập đã tồn tại !", {
                    position: 'top-center',
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "colored"
                    });
                }
                else {
                    toast.success("Đăng ký thành công !", {
                        position: 'top-center',
                        autoClose: 2000,
                        closeOnClick: true,
                        pauseOnHover: false,
                        theme: "colored"
                    });
                    
                    setTimeout(() => {
                        navigate('/signin');
                    }, 2000)                    
                }
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
            else {
                toast.error("Đăng ký thất bại. Lỗi định dạng dữ liệu !", {
                    position: 'top-center',
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "colored"
                });
            }
        } catch (error) {
            toast.error("Đăng ký thất bại. Lỗi không xác định, vui lòng thử lại sau !", {
                    position: 'top-center',
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                    theme: "colored"
                });
        }
        finally {
            setTimeout(() => {
                setIsSubmitting(false);
            }, 2500)
        }
    };

    const handleGoogleSignIn = async (e) => {

    }

    const handleFacebookSignIn = async (e) => {

    }

    const handleAppleSignIn = async (e) => {

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
                <div className="d-flex justify-content-center align-items-center min-vh-100 pt-5 py-5">
                    <div
                        className="card p-4 shadow"
                        style={{
                            width: 500,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            borderRadius: '0.5rem',
                        }}
                    >
                        <div className="d-flex flex-column align-items-center">
                            <img src="/images/icon.png" alt="Logo" width="120" height="120" />
                            <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>
                                Đăng ký
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Họ và tên</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nhập họ và tên"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Số điện thoại</label>
                                <input
                                    type="tel"
                                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Giới tính</label>
                                <select
                                    className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                >
                                    <option value="" disabled>
                                        Chọn giới tính
                                    </option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                    <option value="Không muốn trả lời">Không muốn trả lời</option>
                                </select>
                                {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Ngày sinh</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className={`form-select ${errors.dob ? 'is-invalid' : ''}`}
                                        value={dobDay}
                                        onChange={(e) => setDobDay(Number(e.target.value))}
                                        style={{ backgroundColor: 'white', color: 'black' }}
                                    >
                                        <option value="">Ngày</option>
                                        {days.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className={`form-select ${errors.dob ? 'is-invalid' : ''}`}
                                        value={dobMonth}
                                        onChange={(e) => setDobMonth(Number(e.target.value))}
                                        style={{ backgroundColor: 'white', color: 'black' }}
                                    >
                                        <option value="">Tháng</option>
                                        {months.map((month) => (
                                            <option key={month} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        className={`form-select ${errors.dob ? 'is-invalid' : ''}`}
                                        value={dobYear}
                                        onChange={(e) => setDobYear(Number(e.target.value))}
                                        style={{ backgroundColor: 'white', color: 'black' }}
                                    >
                                        <option value="">Năm</option>
                                        {years.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.dob && <div className="invalid-feedback d-block">{errors.dob}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                {errors.confirmPassword && (<div className="invalid-feedback">{errors.confirmPassword}</div>)}
                                {errors.confirmPasswordNull && <div className="invalid-feedback">{errors.confirmPasswordNull}</div>}
                            </div>

                            <button type="submit" className="btn btn-danger w-100 mb-3">
                                Đăng ký
                            </button>
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
            )}
            <ToastContainer />
        </>
    );
}

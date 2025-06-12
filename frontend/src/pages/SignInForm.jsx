import React, {useState} from 'react';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    username: Yup.string().required('Tên đăng nhập không được để trống'),
    password: Yup.string()
        .required('Mật khẩu không được để trống')
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

export default function SignInForm() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [ isLoading, setIsLoading ] = useState(false);

    if (user.isLoggedIn) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (values, { setSubmitting }) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5270/api/Auth/login', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            if (response.ok) {
                const result = await response.json();
                const token = result.token;
                const avatarBase64 = result.avatarBase64;
                toast.success("Đăng nhập thành công", { position: "top-center", autoClose: 2000, pauseOnHover: false });

                setTimeout(() => {
                    const role = login(token, avatarBase64);
                    navigate(role === "admin" ? '/statistic' : '/');
                }, 2000);
            } else if (response.status === 401) {
                toast.error("Sai tên đăng nhập hoặc mật khẩu", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            } else if (response.status === 403) {
                toast.error("Tài khoản của bạn đã bị khóa", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            } else {
                toast.error("Lỗi máy chủ, vui lòng thử lại sau", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            }
        } catch (error) {
            toast.error("Không thể kết nối đến máy chủ", { position: "top-center", autoClose: 2000, pauseOnHover: false });
        } finally {
            setTimeout(() => {
                setSubmitting(false);
                setIsLoading(false);
            }, 2500)
        }
    };

    return (
        <>
            {isLoading && (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" />
                </div>
            )}

            {!isLoading && (
                <div className="d-flex justify-content-center align-items-center pt-5">
                    <div className="card p-4 shadow" style={{ width: 500, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '0.5rem' }}>
                        <div className="d-flex flex-column align-items-center">
                            <img src="/images/icon.png" alt="Logo" width="120" height="120" />
                            <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>Đăng nhập</h2>
                        </div>

                        <Formik
                            initialValues={{ username: '', password: '' }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Tên đăng nhập</label>
                                        <Field name="username" placeholder="Nhập tên đăng nhập" className="form-control" style={{ backgroundColor: 'white', color: 'black' }} />
                                        <ErrorMessage name="username" component="div" className="text-danger" />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Mật khẩu</label>
                                        <Field name="password" type="password" placeholder="Nhập mật khẩu" className="form-control" style={{ backgroundColor: 'white', color: 'black' }} />
                                        <ErrorMessage name="password" component="div" className="text-danger" />
                                    </div>

                                    <button type="submit" className="btn btn-danger w-100 mb-3" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner size="sm" animation="border" /> : 'Đăng nhập'}
                                    </button>
                                </Form>
                            )}
                        </Formik>

                        <div>
                            <div className="text-center mb-3">Hoặc đăng nhập với</div>

                            <button onClick={() => alert("Google")} className="btn btn-outline-danger w-100 mb-2 position-relative">
                                <Google size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <span className="d-block text-center w-100">Đăng nhập với Google</span>
                            </button>

                            <button onClick={() => alert("Facebook")} className="btn btn-outline-primary w-100 mb-2 position-relative">
                                <Facebook size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                                <span className="d-block text-center w-100">Đăng nhập với Facebook</span>
                            </button>

                            <button onClick={() => alert("Apple")} className="btn btn-outline-secondary w-100 position-relative">
                                <Apple size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
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

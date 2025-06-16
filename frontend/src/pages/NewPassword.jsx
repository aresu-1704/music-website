import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

const validationSchema = Yup.object().shape({
    otp: Yup.string()
        .required('OTP không được để trống')
        .matches(/^\d{6}$/, 'OTP phải có 6 chữ số'),
    newPassword: Yup.string()
        .required('Mật khẩu mới không được để trống')
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    confirmPassword: Yup.string()
        .required('Xác nhận mật khẩu không được để trống')
        .oneOf([Yup.ref('newPassword')], 'Mật khẩu không khớp'),
});

function NewPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const email = location.state?.email;

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (values, { setSubmitting }) => {
        setIsLoading(true);
        try {
            await axios.post('http://localhost:5270/api/Auth/verify-otp', 
                {
                    email,
                    otp: values.otp,
                    newPassword: values.newPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.success('Mật khẩu đã được đặt lại thành công.', {
                position: "top-center",
                autoClose: 2000,
                pauseOnHover: false
            });
            setTimeout(() => {
                navigate('/signin');
            }, 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.', {
                position: "top-center",
                autoClose: 2000,
                pauseOnHover: false
            });
        } finally {
            setSubmitting(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center pt-5">
            <div className="card p-4 shadow" style={{ width: 500, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '0.5rem' }}>
                <div className="d-flex flex-column align-items-center">
                    <img src="/images/icon.png" alt="Logo" width="500" height="500" />
                    <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>Đặt lại mật khẩu</h2>
                </div>

                <Formik
                    initialValues={{ otp: '', newPassword: '', confirmPassword: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <div className="mb-3">
                                <label htmlFor="otp" className="form-label">OTP</label>
                                <Field
                                    name="otp"
                                    type="text"
                                    placeholder="Nhập mã OTP"
                                    className="form-control"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                <ErrorMessage name="otp" component="div" className="text-danger" />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="newPassword" className="form-label">Mật khẩu mới</label>
                                <Field
                                    name="newPassword"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    className="form-control"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                <ErrorMessage name="newPassword" component="div" className="text-danger" />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Xác nhận mật khẩu</label>
                                <Field
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    className="form-control"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                />
                                <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger w-100 mb-3"
                                disabled={isSubmitting || isLoading}
                            >
                                {isSubmitting || isLoading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    'Đặt lại mật khẩu'
                                )}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
            <ToastContainer />
        </div>
    );
}

export default NewPassword; 
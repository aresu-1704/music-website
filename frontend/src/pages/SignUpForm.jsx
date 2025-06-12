import React, {useEffect} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Google, Facebook, Apple } from 'react-bootstrap-icons';
import { Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

export default function SignUpForm() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const currentYear = new Date().getFullYear();
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const validationSchema = Yup.object({
        username: Yup.string().required('Tên đăng nhập không được để trống!'),
        fullName: Yup.string().required('Họ và tên không được để trống!'),
        phone: Yup.string()
            .matches(/^\d{10}$/, 'Số điện thoại không đúng định dạng!')
            .required('Số điện thoại không được để trống!'),
        gender: Yup.string().required('Vui lòng chọn giới tính!'),
        dobDay: Yup.number().required('Vui lòng chọn ngày sinh!'),
        dobMonth: Yup.number().required('Vui lòng chọn tháng sinh!'),
        dobYear: Yup.number().required('Vui lòng chọn năm sinh!'),
        email: Yup.string().email('Email không đúng định dạng!').required('Email không được để trống!'),
        password: Yup.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự!').required('Mật khẩu không được để trống!'),
        confirmPassword: Yup.string()
            .required('Vui lòng xác nhận mật khẩu!')
            .oneOf([Yup.ref('password')], 'Mật khẩu và xác nhận mật khẩu không khớp!'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const dob = `${values.dobYear}-${values.dobMonth.toString().padStart(2, '0')}-${values.dobDay.toString().padStart(2, '0')}`;

        const genderMap = {
            'Nam': 1,
            'Nữ': 2,
            'Khác': 3,
            'Không muốn trả lời': 4,
        };

        try {
            const response = await fetch('http://localhost:5270/api/Auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    fullname: values.fullName,
                    email: values.email,
                    password: values.password,
                    phoneNumber: values.phone,
                    dateOfBirth: dob,
                    gender: genderMap[values.gender],
                }),
            });

            if (response.ok) {
                const result = await response.json();
                const message = result['message'];

                if (message.includes('Email đã tồn tại')) {
                    toast.error('Đăng ký thất bại. Email đã tồn tại!', { position: 'top-center', autoClose: 2000, pauseOnHover: false});
                } else if (message.includes('Tên đăng nhập đã tồn tại')) {
                    toast.error('Đăng ký thất bại. Tên đăng nhập đã tồn tại!', { position: 'top-center', autoClose: 2000, pauseOnHover: false });
                } else {
                    toast.success('Đăng ký thành công!', { position: 'top-center', autoClose: 2000, pauseOnHover: false });
                    setTimeout(() => navigate('/signin'), 2000);
                }
            } else {
                toast.error('Lỗi máy chủ hoặc định dạng dữ liệu không hợp lệ!', { position: 'top-center', autoClose: 2000, pauseOnHover: false });
            }
        } catch (err) {
            toast.error('Đăng ký thất bại. Lỗi không xác định!', { position: 'top-center', autoClose: 2000, pauseOnHover: false  });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (user.isLoggedIn) {
            setTimeout(() => {
                navigate('/');
            }, 2000)
        }
    }, [user]);


    return (
        <>
            {user.isLoggedIn && (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" />
                </div>
            )}

            {!user.isLoggedIn && (
                <div className="d-flex justify-content-center align-items-center min-vh-100 pt-5 py-5">
                    <div className="card p-4 shadow" style={{ width: 500, backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white' }}>
                        <div className="text-center mb-4">
                            <img src="/images/icon.png" alt="Logo" width="120" height="120" />
                            <h2 style={{ color: '#ff4d4f' }}>Đăng ký</h2>
                        </div>

                        <Formik
                            initialValues={{
                                username: '', fullName: '', phone: '', gender: '',
                                dobDay: '', dobMonth: '', dobYear: '',
                                email: '', password: '', confirmPassword: ''
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    {['username', 'fullName', 'phone', 'email'].map((field, i) => (
                                        <div key={i} className="mb-3">
                                            <label className="form-label">{field === 'fullName' ? 'Họ và tên' : field === 'phone' ? 'Số điện thoại' : field === 'username' ? 'Tên đăng nhập' : 'Email'}</label>
                                            <Field
                                                name={field}
                                                type={field === 'email' ? 'email' : 'text'}
                                                placeholder={`Nhập ${field === 'fullName' ? 'họ và tên' : field === 'phone' ? 'số điện thoại' : field === 'username' ? 'tên đăng nhập' : 'email'}`}
                                                className="form-control"
                                                style={{ backgroundColor: 'white', color: 'black' }}
                                            />
                                            <ErrorMessage name={field} component="div" className="text-danger" />
                                        </div>
                                    ))}

                                    <div className="mb-3">
                                        <label className="form-label">Giới tính</label>
                                        <Field as="select" name="gender" className="form-select" style={{ backgroundColor: 'white', color: 'black' }}>
                                            <option value="" disabled>Chọn giới tính</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                            <option value="Không muốn trả lời">Không muốn trả lời</option>
                                        </Field>
                                        <ErrorMessage name="gender" component="div" className="text-danger" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ngày sinh</label>
                                        <div className="d-flex gap-2">
                                            <Field as="select" name="dobDay" className="form-select" style={{ backgroundColor: 'white', color: 'black' }}>
                                                <option value="">Ngày</option>
                                                {days.map((d) => <option key={d} value={d}>{d}</option>)}
                                            </Field>
                                            <Field as="select" name="dobMonth" className="form-select" style={{ backgroundColor: 'white', color: 'black' }}>
                                                <option value="">Tháng</option>
                                                {months.map((m) => <option key={m} value={m}>{m}</option>)}
                                            </Field>
                                            <Field as="select" name="dobYear" className="form-select" style={{ backgroundColor: 'white', color: 'black' }}>
                                                <option value="">Năm</option>
                                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                                            </Field>
                                        </div>
                                        <ErrorMessage name="dobDay" component="div" className="text-danger" />
                                        <ErrorMessage name="dobMonth" component="div" className="text-danger" />
                                        <ErrorMessage name="dobYear" component="div" className="text-danger" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Mật khẩu</label>
                                        <Field name="password" type="password" className="form-control" placeholder="Nhập mật khẩu"
                                               style={{ backgroundColor: 'white', color: 'black' }} />
                                        <ErrorMessage name="password" component="div" className="text-danger" />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Xác nhận mật khẩu</label>
                                        <Field name="confirmPassword" type="password" className="form-control" placeholder="Nhập lại mật khẩu"
                                               style={{ backgroundColor: 'white', color: 'black' }} />
                                        <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
                                    </div>

                                    <button type="submit" className="btn btn-danger w-100 mb-3" disabled={isSubmitting}>
                                        {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Đăng ký'}
                                    </button>
                                </Form>
                            )}
                        </Formik>

                        <div className="text-center mb-3">Hoặc đăng ký với</div>
                        <button className="btn btn-outline-danger w-100 mb-2"><Google size={20} className="me-2" />Đăng ký với Google</button>
                        <button className="btn btn-outline-primary w-100 mb-2"><Facebook size={20} className="me-2" />Đăng ký với Facebook</button>
                        <button className="btn btn-outline-secondary w-100"><Apple size={20} className="me-2" />Đăng ký với Apple</button>
                    </div>
                </div>
            )}
            <ToastContainer />
        </>
    );
}
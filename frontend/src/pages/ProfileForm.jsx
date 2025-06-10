import React, {useState} from 'react';
import {Container, Nav, Tab, Row, Col, Spinner} from 'react-bootstrap';
import { Person, GeoAlt, ShieldLock, Link45deg } from 'react-bootstrap-icons';
import '../styles/Profile.css'
import {useNavigate, useParams} from "react-router-dom";
import { queryClient } from "../context/QueryClientContext";
import { useUserProfile, updatePersonalData, updatePersonalDataWithAvatar } from "../services/ProfileService";
import { toast, ToastContainer } from "react-toastify";
import {Field, Form, Formik} from "formik";
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext'

export default function ProfileForm() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { data: userData, isLoading, error, refetch } = useUserProfile(userId);
    const [ isSubmitting, setSubmitting ] = useState(false);
    const { logout } = useAuth();

    if (userData == null){
        toast.error("Không thể kết nối đến máy chủ", { position: "top-center", autoClose: 2000, pauseOnHover: false });
    }

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status" />
            </div>
        );
    }

    if(error){
        toast.error(error, { position: "top-center", autoClose: 3000 });
    }

    const dob = userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date();
    const initialValues = {
        fullname: userData.fullname || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        day: dob.getDate().toString().padStart(2, '0'),
        month: (dob.getMonth() + 1).toString().padStart(2, '0'),
        year: dob.getFullYear().toString(),
        gender: userData.gender || 0,
        avatarBase64: userData.avatarBase64 || '',
        avatarFile: null,
        avatarPreview: '',
    };

    const profileSchema = Yup.object().shape({
        fullname: Yup.string().required("Họ tên không được bỏ trống"),
        email: Yup.string().email("Email không hợp lệ").required("Email không được bỏ trống"),
        phoneNumber: Yup.string().required("Số điện thoại không được bỏ trống"),
        day: Yup.number().min(1).max(31).required("Ngày không hợp lệ"),
        month: Yup.number().min(1).max(12).required("Tháng không hợp lệ"),
        year: Yup.number().min(1900).max(new Date().getFullYear()).required("Năm không hợp lệ"),
    });

    const handleSubmitNoAvt = async (data) => {
        let result = await updatePersonalData(userId, JSON.stringify(data));
        try {
            if (result === "Thành công") {
                await refetch();
                toast.success("Cập nhật thành công!", {
                    position: "top-center",
                    autoClose: 2000,
                    pauseOnHover: false
                });
                await queryClient.invalidateQueries(['profile', userId]);

            } else if (result === "Phiên đăng nhập hết hạn") {
                logout();
                toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", {
                    position: "top-center",
                    autoClose: 2000
                });
                navigate('/signin');
            } else if (result === "Không thể kết nối đến máy chủ") {
                toast.error("Không thể kết nối đến máy chủ", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            } else {
                toast.error(result || "Lỗi không xác định", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi hệ thống", { position: "top-center", autoClose: 2000, pauseOnHover: false });
        }
        finally {
            setTimeout(() => {
                setSubmitting(false);
            }, 2500)
        }
    }

    const handleSubmitAvatar = async (formData) => {
        let result = await updatePersonalDataWithAvatar(userId, formData);
        try {
            if (result === "Thành công") {
                await refetch();
                toast.success("Cập nhật thành công!", {
                    position: "top-center",
                    autoClose: 2000,
                    pauseOnHover: false
                });
                await queryClient.invalidateQueries(['profile', userId]);
            } else if (result === "Phiên đăng nhập hết hạn") {
                toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", {
                    position: "top-center",
                    autoClose: 2000
                });
                navigate('/signin');
            } else if (result === "Không thể kết nối đến máy chủ") {
                toast.error("Không thể kết nối đến máy chủ", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            } else {
                toast.error(result || "Lỗi không xác định", { position: "top-center", autoClose: 2000, pauseOnHover: false });
            }
        } catch (err) {
            console.error(err);
            toast.error("Lỗi hệ thống", { position: "top-center", autoClose: 2000, pauseOnHover: false });
        }
        finally {
            setTimeout(() => {
                setSubmitting(false);
            }, 2500)
        }
    }

    return (
        <>
            <Container fluid className="account-settings px-5 pt-5">
            <h1 className="settings-title text-white text-center mb-4">Cài đặt tài khoản</h1>
                <Tab.Container defaultActiveKey="profile">
                    <Row>
                        <Col xl={3} lg={4} md={5} className="custom-sidebar">
                            <Nav variant="pills" className="flex-column custom-tab-nav">
                                <Nav.Item>
                                    <Nav.Link eventKey="profile">
                                        <Person className="me-2" /> Thông tin cá nhân
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="contact">
                                        <GeoAlt className="me-2" /> Địa chỉ liên lạc
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="social">
                                        <Link45deg className="me-2" /> Liên kết mạng xã hội
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="security">
                                        <ShieldLock className="me-2" /> Mật khẩu & Bảo mật
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col xl={9} lg={8} md={7}>
                            <Tab.Content className="p-4 bg-dark rounded shadow text-light">
                                <Tab.Pane eventKey="profile">
                                    <h2 className={"mb-3"}>Thông tin cá nhân</h2>
                                    {isSubmitting && (
                                        <div className="d-flex justify-content-center align-items-center">
                                            <Spinner animation="border" role="status" />
                                        </div>
                                    )}

                                    {!isSubmitting && (
                                        <Formik
                                            initialValues={initialValues}
                                            validationSchema={profileSchema}
                                            enableReinitialize
                                            onSubmit={async (values) => {
                                                setSubmitting(true)

                                                const dateOfBirth = `${values.year.padStart(2, '0')}-${values.month.padStart(2, '0')}-${values.day.padStart(2, '0')}T00:00:00Z`;

                                                if (values.avatarFile) {
                                                    const formData = new FormData();
                                                    formData.append('Fullname', values.fullname);
                                                    formData.append('Gender', values.gender.toString());
                                                    formData.append('DateOfBirth', dateOfBirth);
                                                    formData.append('Avatar', values.avatarFile);

                                                    await handleSubmitAvatar(formData);
                                                }
                                                else {
                                                    const submitData = {
                                                        fullname: values.fullname,
                                                        gender: values.gender,
                                                        dateOfBirth,
                                                    };

                                                    await handleSubmitNoAvt(submitData);
                                                }

                                            }}
                                        >
                                            {({ values, setFieldValue, resetForm }) => (
                                                <Form>
                                                    {/* Avatar + nút đổi */}
                                                    <div className="text-center mb-4">
                                                        <img
                                                            src={values.avatarBase64 || values.avatarPreview || '/images/default-avatar.jpg'}
                                                            alt="Avatar"
                                                            className="rounded-circle"
                                                            style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                                        />
                                                        <div className="mt-2">
                                                            <label className="btn btn-outline-light btn-sm">
                                                                Đổi ảnh
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    hidden
                                                                    onChange={(e) => {
                                                                        const file = e.target.files[0];
                                                                        if (file) {
                                                                            setFieldValue("avatarBase64", null);
                                                                            setFieldValue("avatarFile", file);
                                                                            setFieldValue("avatarPreview", URL.createObjectURL(file));
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Họ tên */}
                                                    <div className="mb-3">
                                                        <label>Họ tên</label>
                                                        <Field name="fullname" type="text" className="form-control" />
                                                    </div>

                                                    {/* Giới tính */}
                                                    <div className="mb-3">
                                                        <label>Giới tính</label>
                                                        <Field as="select" name="gender" className="form-control">
                                                            <option value={0}>Nam</option>
                                                            <option value={1}>Nữ</option>
                                                            <option value={2}>Khác</option>
                                                            <option value={3}>Không muốn trả lời</option>
                                                        </Field>
                                                    </div>

                                                    {/* Ngày sinh */}
                                                    <div className="mb-3">
                                                        <label>Ngày sinh</label>
                                                        <div className="d-flex gap-2">
                                                            <Field name="day" type="number" placeholder="Ngày" className="form-control" />
                                                            <Field name="month" type="number" placeholder="Tháng" className="form-control" />
                                                            <Field name="year" type="number" placeholder="Năm" className="form-control" />
                                                        </div>
                                                    </div>

                                                    {/* Nút submit */}
                                                    <div className="text-end mt-4 d-flex justify-content-end gap-2">
                                                        <button type="button" onClick={() => resetForm()} className="btn btn-dark">Hủy</button>
                                                        <button type="submit" className="btn btn-danger">Cập nhật</button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="contact">[Form Địa chỉ liên lạc]</Tab.Pane>
                                <Tab.Pane eventKey="social">[Liên kết mạng xã hội]</Tab.Pane>
                                <Tab.Pane eventKey="security">[Mật khẩu & bảo mật]</Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
            <ToastContainer />
        </>
    );
};

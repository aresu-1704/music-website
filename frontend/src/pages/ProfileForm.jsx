import React, {useEffect, useState} from 'react';
import {Container, Nav, Tab, Row, Col, Spinner, Button, Alert, Card} from 'react-bootstrap';
import { Person, GeoAlt, ShieldLock, Link45deg } from 'react-bootstrap-icons';
import '../styles/Profile.css'
import {useNavigate, useParams} from "react-router-dom";
import { queryClient } from "../context/QueryClientContext";
import { useUserProfile, updatePersonalData, updatePersonalDataWithAvatar } from "../services/ProfileService";
import { toast, ToastContainer } from "react-toastify";
import {Field, Form, Formik} from "formik";
import * as Yup from 'yup';
import { useAuth } from '../context/authContext'
import {useLoginSessionOut} from "../services/loginSessionOut";

export default function ProfileForm() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { data: userData, isLoading, error, refetch } = useUserProfile(userId);
    const [ isSubmitting, setSubmitting ] = useState(false);
    const { user, logout } = useAuth();
    const handleSessionOut = useLoginSessionOut()

    if (isLoading) {
        return (
            <Container fluid className="bg-dark py-5" style={{ minHeight: '100vh' }}>
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <Spinner animation="border" role="status" />
                </div>
            </Container>
        );
    }

    if(error){
        toast.error(error, { position: "top-center", autoClose: 3000 });
    }

    const expiredDate = new Date(userData.expiredDate);
    const today = new Date();
    const diffTime = expiredDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
                handleSessionOut();
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
                handleSessionOut();
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
                                {user.role !== "admin" && user.role !== "normal" && user.role !== "artist" && (
                                    <Nav.Item>
                                        <Nav.Link eventKey="tier">
                                            <ShieldLock className="me-2" /> Gói nâng cấp tài khoản
                                        </Nav.Link>
                                    </Nav.Item>
                                )}
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
                                    <Card className="bg-dark text-light shadow-lg p-4 rounded-4">
                                        <h2 className={"mb-3 border-bottom pb-2"}>👤 Thông tin cá nhân</h2>
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
                                                                src={values.avatarBase64 || values.avatarPreview || '/images/default-avatar.png'}
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
                                    </Card>
                                </Tab.Pane>
                                <Tab.Pane eventKey="contact">[Form Địa chỉ liên lạc]</Tab.Pane>
                                <Tab.Pane eventKey="social">[Liên kết mạng xã hội]</Tab.Pane>
                                <Tab.Pane eventKey="tier">
                                    <Card className="bg-dark text-light shadow-lg p-4 rounded-4">
                                        <h2 className="mb-4 border-bottom pb-2">✨ Quản lý gói nâng cấp</h2>

                                        <Row className="mb-3 align-items-center">
                                            <Col md={4} className="fw-bold d-flex align-items-center">
                                                <i className="bi bi-box-seam me-2" /> Tên gói:
                                            </Col>
                                            <Col md={8}>
                                                <span className="text-info">{user.role}</span>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3 align-items-center">
                                            <Col md={4} className="fw-bold d-flex align-items-center">
                                                <i className="bi bi-calendar-check me-2" /> Ngày hết hạn:
                                            </Col>
                                            <Col md={8}>
                                                <span className="text-warning">{expiredDate.toLocaleDateString('vi-VN')}</span>
                                            </Col>
                                        </Row>

                                        <Row className="mb-3 align-items-center">
                                            <Col md={4} className="fw-bold d-flex align-items-center">
                                                <i className="bi bi-hourglass-split me-2" /> Số ngày còn lại:
                                            </Col>
                                            <Col md={8}>
                                                {daysRemaining > 0 ? (
                                                    <span className={`badge bg-${daysRemaining <= 7 ? 'warning text-dark' : 'success'}`}>
                                                      {daysRemaining} ngày
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-danger">Đã hết hạn</span>
                                                )}
                                            </Col>
                                        </Row>

                                        {daysRemaining <= 7 && (
                                            <Alert variant="warning" className="rounded-3 mt-3">
                                                ⚠️ Gói của bạn sắp hết hạn. Vui lòng gia hạn để không bị gián đoạn dịch vụ.
                                            </Alert>
                                        )}

                                        <div className="text-end mt-4">
                                            <Button
                                                variant="danger"
                                                className="px-4 py-2 fw-bold"
                                                onClick={() => navigate(`/upgrade/${user.id}`)}
                                            >
                                                Gia hạn ngay
                                            </Button>
                                        </div>
                                    </Card>

                                </Tab.Pane>
                                <Tab.Pane eventKey="security">

                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Container>
            <ToastContainer />
        </>
    );
};

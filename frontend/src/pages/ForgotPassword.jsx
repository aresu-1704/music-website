import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không đúng định dạng')
    .required('Email không được để trống'),
});

function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    try {
      // No longer sending OTP automatically here. OTP will be sent on NewPassword page.
      toast.success('Vui lòng xác thực OTP trên trang tiếp theo.', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false,
      });

      setTimeout(() => {
        navigate('/new-password', { state: { email: values.email } });
      }, 1500);
    } catch (err) {
      // This catch block is mostly for client-side errors now, as API call is moved
      toast.error(err.message || 'Đã xảy ra lỗi.', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false,
      });
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center pt-5">
      <div
        className="card p-4 shadow"
        style={{
          width: 500,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '0.5rem',
        }}
      >
        <div className="d-flex flex-column align-items-center">
          <img src="/images/icon.png" alt="Logo" width="120" height="120" />
          <h2 className="mb-4 text-center" style={{ color: '#ff4d4f' }}>
            Quên mật khẩu
          </h2>
        </div>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="form-control"
                  style={{ backgroundColor: 'white', color: 'black' }}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
              </div>

              <button
                type="submit"
                className="btn btn-danger w-100 mb-3"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Tiếp tục'
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

export default ForgotPassword;
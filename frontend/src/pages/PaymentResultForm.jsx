import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

export default function PaymentResultForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const searchParams = location.search;
                const apiUrl = `http://localhost:5270/api/VnPay/return${searchParams}`;
                const response = await axios.get(apiUrl);

                setResult(response.data);

            } catch (err) {
                setError('Lỗi khi xác thực giao dịch với hệ thống. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [location.search]);

    const formatCurrency = (amount) => {
        return (Number(amount) / 100).toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '85vh',
            background: 'linear-gradient(to bottom, #000000cc, #111111cc)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8rem'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Card className="shadow-lg text-white" style={{ backgroundColor: '#222', border: '1px solid #444' }}>
                            <Card.Body>
                                <h2 className="text-center mb-4" style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Kết quả thanh toán
                                </h2>

                                {error ? (
                                    <Alert variant="danger" className="text-center fs-5 fw-bold">
                                        ❌ {error}
                                    </Alert>
                                ) : (
                                    <>
                                        <Alert variant={result.success ? 'success' : 'danger'} className="text-center fs-5 fw-bold">
                                            {result.success ? '✅ Thanh toán thành công!' : '❌ Thanh toán thất bại.'}
                                        </Alert>

                                        <Row className="mb-3 fs-5">
                                            <Col sm={5}><strong>Mã giao dịch:</strong></Col>
                                            <Col sm={7} className="text-break">{result.orderId}</Col>
                                        </Row>
                                        <Row className="mb-3 fs-5">
                                            <Col sm={5}><strong>Phương thức:</strong></Col>
                                            <Col sm={7}>{result.paymentMethod}</Col>
                                        </Row>
                                        <Row className="mb-3 fs-5">
                                            <Col sm={5}><strong>Người dùng:</strong></Col>
                                            <Col sm={7} className="text-break">{result.userId}</Col>
                                        </Row>
                                        <Row className="mb-3 fs-5">
                                            <Col sm={5}><strong>Gói:</strong></Col>
                                            <Col sm={7}>{result.tier}</Col>
                                        </Row>
                                    </>
                                )}

                                {result.success && (
                                    <p className="text-center text-warning fw-medium mt-3">
                                        ⚠️ Vui lòng đăng xuất và đăng nhập lại để hệ thống cập nhật gói tài khoản mới.
                                    </p>
                                )}
                                <div className="text-center mt-3">
                                    <Button variant="danger" size="lg" onClick={() => navigate('/')}>
                                        Quay về trang chủ
                                    </Button>
                                </div>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

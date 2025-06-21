import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { fetchPaymentResult } from '../services/paymentService';

export default function PaymentResultForm() {
    const location = useLocation();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadResult = async () => {
            const searchParams = location.search;

            const params = new URLSearchParams(searchParams);
            const responseCode = params.get('vnp_ResponseCode');
            const transactionStatus = params.get('vnp_TransactionStatus');

            if (!responseCode || !transactionStatus) {
                setError('Không có dữ liệu giao dịch. Có thể bạn đã hủy trước khi hoàn tất.');
                setLoading(false);
                return;
            }

            try {
                const data = await fetchPaymentResult(searchParams);
                setResult(data);
            } catch (err) {
                console.error(err);
                setError('Lỗi khi xác thực giao dịch với hệ thống. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        loadResult();
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
                {error || !result || !result.orderId ? (
                    <Alert variant="danger" className="text-center fs-5 fw-bold">
                        ❌ {error || 'Thanh toán thất bại hoặc bị hủy giữa chừng.'}
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
            </Container>
        </div>
    );
}

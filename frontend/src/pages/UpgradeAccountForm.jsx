import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { BadgeCheck, Star, Music, Download, Headphones, ShieldCheck, UploadCloud, Users } from "lucide-react";

const UpgradeAccount = () => {
  const tiers = [
    {
      title: "VIP",
      icon: <BadgeCheck size={40} color="#facc15" />,
      description: [
        { text: "Truy cập không giới hạn", icon: <ShieldCheck size={18} className="text-success" /> },
        { text: "Bỏ quảng cáo", icon: <BadgeCheck size={18} className="text-success" /> },
        { text: "Ưu tiên hỗ trợ", icon: <Users size={18} className="text-success" /> },
      ],
      price: "99.000₫ / tháng",
      buttonLabel: "Nâng cấp VIP",
      highlight: false,
    },
    {
      title: "Premium",
      icon: <Star size={40} color="#a855f7" />,
      description: [
        { text: "Chất lượng cao", icon: <Headphones size={18} className="text-primary" /> },
        { text: "Tải về không giới hạn", icon: <Download size={18} className="text-primary" /> },
        { text: "Nội dung độc quyền", icon: <Star size={18} className="text-primary" /> },
      ],
      price: "199.000₫ / tháng",
      buttonLabel: "Nâng cấp Premium",
      highlight: true,
    },
    {
      title: "Nghệ sĩ",
      icon: <Music size={40} color="#ec4899" />,
      description: [
        { text: "Tạo hồ sơ nghệ sĩ", icon: <Music size={18} className="text-pink" /> },
        { text: "Chia sẻ nhạc", icon: <UploadCloud size={18} className="text-pink" /> },
        { text: "Kiếm tiền từ người nghe", icon: <Users size={18} className="text-pink" /> },
      ],
      price: "Miễn phí đăng ký",
      buttonLabel: "Đăng ký nghệ sĩ",
      highlight: false,
    },
  ];

  return (
      <div className="container py-5 text-light rounded">
        <h2 className="text-center fw-bold mb-5 text-white">✨ Chọn gói nâng cấp phù hợp ✨</h2>
        <div className="row g-4 justify-content-center">
          {tiers.map((tier, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={index}>
                <Card
                    className={`h-100 text-center shadow-lg upgrade-card ${
                        tier.highlight ? "border border-warning" : "border border-secondary"
                    }`}
                    bg="dark"
                    text="light"
                >
                  <Card.Body className="d-flex flex-column align-items-center justify-content-between p-4">
                    {tier.highlight && (
                        <Badge bg="warning" text="dark" className="mb-2">
                          Khuyến nghị
                        </Badge>
                    )}
                    <div className="mb-3">{tier.icon}</div>
                    <Card.Title className="fs-3 fw-bold text-white mb-3">{tier.title}</Card.Title>

                    <ul className="text-light fs-6 text-start px-3 mb-4 list-unstyled w-100">
                      {tier.description.map((item, i) => (
                          <li key={i} className="d-flex align-items-center gap-2 mb-2 hover-glow">
                            {item.icon}
                            <span>{item.text}</span>
                          </li>
                      ))}
                    </ul>

                    <h4 className="mb-3 text-info fw-bold">{tier.price}</h4>
                    <Button variant="warning" className="w-100 fs-5 fw-semibold text-dark">
                      {tier.buttonLabel}
                    </Button>
                  </Card.Body>
                </Card>
              </div>
          ))}
        </div>
      </div>
  );
};

export default UpgradeAccount;

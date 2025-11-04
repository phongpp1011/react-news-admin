import React from "react";
import Marquee from "react-fast-marquee";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function TrendingNews() {
  return (
    <section className="trending-area fix pt-3 pb-3" style={{ background: "#f7f7f7" }}>
      <div className="container">
        <div className="row align-items-center">
          {/* Trending Title */}
          <div className="col-lg-2 col-md-3">
            <div className="trending-title">
              <strong>Trending now</strong>
            </div>
          </div>

          {/* Marquee text */}
          <div className="col-lg-10 col-md-9">
            <div className="trending-tittle">
              <Marquee gradient={false} speed={60}>
                <span style={{ marginRight: "50px" }}>
                  🔥 Tin nóng: Chính phủ vừa công bố gói hỗ trợ kinh tế mới dành cho doanh nghiệp nhỏ và vừa.
                </span>
                <span style={{ marginRight: "50px" }}>
                  ⚽ Bóng đá: Đội tuyển Việt Nam thắng đậm 3-0 trong trận giao hữu quốc tế.
                </span>
                <span style={{ marginRight: "50px" }}>
                  🎬 Giải trí: Bom tấn “Hành tinh Z” xác nhận ngày khởi chiếu toàn cầu.
                </span>
                <span style={{ marginRight: "50px" }}>
                  💻 Công nghệ: React 19 chính thức phát hành, hiệu năng vượt trội hơn 30%.
                </span>
              </Marquee>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrendingNews;

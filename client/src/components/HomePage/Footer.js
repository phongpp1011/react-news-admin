import React from "react";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function Footer() {
  return (
    <footer>
      <div className="footer-area footer-padding">
        <div className="container">
          <div className="row justify-content-between">
            {/* Logo + mô tả */}
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-8">
              <div className="single-footer-caption mb-50">
                <div className="footer-logo">
                  <a href="/">
                    <img
                      src="/assets/img/logo/logo.png"
                      alt="logo"
                      style={{ height: "50px" }}
                    />
                  </a>
                </div>
                <div className="footer-tittle">
                  <div className="footer-pera">
                    <p className="info1">
                      Trang tin tức cập nhật nhanh nhất — từ công nghệ, thể thao
                      đến đời sống. Tin nóng mỗi ngày, vì bạn xứng đáng được biết sớm nhất.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh mục */}
            <div className="col-xl-2 col-lg-2 col-md-4 col-sm-6">
              <div className="single-footer-caption mb-50">
                <div className="footer-tittle">
                  <h4>Danh mục</h4>
                  <ul>
                    <li>
                      <a href="/category/tech">Công nghệ</a>
                    </li>
                    <li>
                      <a href="/category/sports">Thể thao</a>
                    </li>
                    <li>
                      <a href="/category/entertainment">Giải trí</a>
                    </li>
                    <li>
                      <a href="/category/life">Đời sống</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Liên hệ */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-8">
              <div className="single-footer-caption mb-50">
                <div className="footer-tittle">
                  <h4>Liên hệ</h4>
                  <ul>
                    <li>
                      <p>Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                    </li>
                    <li>
                      <a href="mailto:contact@newsportal.vn">
                        Email: contact@newsportal.vn
                      </a>
                    </li>
                    <li>
                      <a href="tel:+84912345678">Hotline: +84 912 345 678</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Mạng xã hội */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-8">
              <div className="single-footer-caption mb-50">
                <div className="footer-tittle">
                  <h4>Theo dõi chúng tôi</h4>
                  <div className="footer-social">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dòng bản quyền */}
          <div className="row">
            <div className="col-xl-12">
              <div className="footer-copy-right text-center mt-4">
                <p>
                  © 2025 <strong>NewsPortal</strong>. All rights reserved | Designed
                  for your graduation project 
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

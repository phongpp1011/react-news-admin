import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  // Load user & categories khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("news_user");
    if (savedUser) setUser(savedUser);

    axios
      .get("http://localhost:8081/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories);
      })
      .catch((err) => console.error("Lỗi khi tải categories:", err));
  }, []);

  // Logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có muốn đăng xuất không?");
    if (confirmLogout) {
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("news_user");
      setUser(null);
      alert("Đã đăng xuất thành công!");
      navigate("/");
    }
  };

  // Submit tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  return (
    <header>
      <div className="header-area">
        <div className="main-header">
          {/* HEADER TOP */}
          <div className="header-top black-bg d-none d-md-block position-relative">
            <div className="container">
              <div className="d-flex justify-content-between align-items-center py-2">
                {/* Thời tiết + ngày */}
                <ul className="mb-0 d-flex align-items-center text-white gap-3">
                  <li className="d-flex align-items-center gap-1">
                    <img src="/assets/img/icon/header_icon1.png" alt="" />
                    34ºc, Sunny
                  </li>
                  <li className="d-flex align-items-center gap-1">
                    <img src="/assets/img/icon/header_icon1.png" alt="" />
                    Wednesday, 15th Oct, 2025
                  </li>
                </ul>

                {/* Social + Login/Logout */}
                <div className="d-flex align-items-center gap-3">
                  <ul className="header-social d-flex align-items-center mb-0 gap-2">
                    <li>
                      <a href="#">
                        <i className="fab fa-twitter text-white"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fab fa-instagram text-white"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fab fa-pinterest-p text-white"></i>
                      </a>
                    </li>
                  </ul>

                  {/* User Info */}
                  {user ? (
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: "#fff", fontWeight: "bold" }}>
                        Xin chào, {user}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={handleLogout}
                        title="Logout"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HEADER MID (Logo + Banner) */}
          <div className="header-mid d-none d-md-block">
            <div className="container">
              <div className="row d-flex align-items-center">
                <div className="col-xl-3 col-lg-3 col-md-3">
                  <div className="logo">
                    <a href="/">
                      <img src="/assets/img/logo/logo.png" alt="logo" />
                    </a>
                  </div>
                </div>
                <div className="col-xl-9 col-lg-9 col-md-9">
                  <div className="header-banner f-right">
                    <img
                      src="/assets/img/hero/header_card.jpg"
                      alt="banner"
                      className="img-fluid"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HEADER BOTTOM (Menu + Search) */}
          <div className="header-bottom header-sticky">
            <div className="container">
              <div className="row align-items-center">
                {/* Menu */}
                <div className="col-xl-9 col-lg-9 col-md-12 header-flex">
                  <div className="main-menu d-none d-md-block">
                    <nav>
                      <ul id="navigation" className="d-flex gap-3 align-items-center">
                        <li>
                          <a href="/">Home</a>
                        </li>

                        {/* Dropdown Categories */}
                        <li className="dropdown position-relative">
                          <a href="#">Categories ▾</a>
                          <ul
                            className="submenu bg-white shadow rounded"
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              zIndex: 20,
                              minWidth: "220px",
                            }}
                          >
                            {categories.length > 0 ? (
                              categories.map((cat) => (
                                <li key={cat.id}>
                                  <a
                                    href={`/category/${cat.slug}`}
                                    style={{
                                      color: "#333",
                                      padding: "8px 15px",
                                      display: "block",
                                    }}
                                  >
                                    {cat.name}
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li>
                                <span className="text-muted px-3">Đang tải...</span>
                              </li>
                            )}
                          </ul>
                        </li>

                        <li>
                          <a href="/about">About</a>
                        </li>
                        <li>
                          <a href="/latest">Latest News</a>
                        </li>
                        <li>
                          <a href="/contact">Contact</a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>

                {/* Search bar cố định */}
                <div className="col-xl-3 col-lg-3 col-md-12 mt-3 mt-lg-0">
                  <form
                    onSubmit={handleSearch}
                    className="d-flex align-items-center"
                    style={{ maxWidth: "280px", marginLeft: "auto" }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="🔍 Tìm kiếm bài viết..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        borderRadius: "20px",
                        padding: "6px 15px",
                        fontSize: "14px",
                      }}
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

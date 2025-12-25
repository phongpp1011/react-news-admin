import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminFooter from "./AdminFooter";
import ArticlesList from "./Articles/ArticlesList";
import AddArticle from "./Articles/AddArticle";
import CommentsList from "./Comments/CommentsList"; //  Thêm import
import UsersList from "./Users/UsersList";
import CategoriesList from "./Categories/CategoriesList";
// import PendingArticles from "./Articles/PendingArticles";


import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function AdminDashboard({ setRole }) {
  return (
    <div id="wrapper" className="d-flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column flex-grow-1">
        <div id="content">
          {/* Topbar */}
          <AdminTopbar setRole={setRole} />

          {/* Router hiển thị nội dung từng trang Admin */}
          <div className="container-fluid" id="container-wrapper">
            <Routes>
              {/* Mặc định hiển thị Dashboard nếu truy cập /admin */}
              <Route
                path="/"
                element={
                  <>
                    <div className="d-sm-flex align-items-center justify-content-between mb-4">
                      <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                      <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                          <a href="#">Home</a>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                          Dashboard
                        </li>
                      </ol>
                    </div>

                    {/* Statistic Cards */}
                    <div className="row mb-3">
                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                              <div className="text-xs font-weight-bold text-uppercase mb-1">
                                Bài viết mới
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">124</div>
                              <small className="text-success">
                                <i className="fa fa-arrow-up"></i> +12% tháng này
                              </small>
                            </div>
                            <i className="fas fa-newspaper fa-2x text-primary"></i>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                              <div className="text-xs font-weight-bold text-uppercase mb-1">
                                Người dùng
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">542</div>
                              <small className="text-info">
                                <i className="fa fa-arrow-up"></i> +8%
                              </small>
                            </div>
                            <i className="fas fa-users fa-2x text-info"></i>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                              <div className="text-xs font-weight-bold text-uppercase mb-1">
                                Bình luận
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">89</div>
                              <small className="text-warning">
                                <i className="fa fa-arrow-up"></i> +2%
                              </small>
                            </div>
                            <i className="fas fa-comments fa-2x text-warning"></i>
                          </div>
                        </div>
                      </div>

                      <div className="col-xl-3 col-md-6 mb-4">
                        <div className="card h-100">
                          <div className="card-body d-flex align-items-center justify-content-between">
                            <div>
                              <div className="text-xs font-weight-bold text-uppercase mb-1">
                                Yêu cầu phê duyệt
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">15</div>
                              <small className="text-danger">
                                <i className="fa fa-arrow-down"></i> -3%
                              </small>
                            </div>
                            <i className="fas fa-tasks fa-2x text-danger"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Placeholder content */}
                    <div className="row">
                      <div className="col-lg-8 mb-4">
                        <div className="card">
                          <div className="card-header py-3 d-flex justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">
                              Thống kê truy cập
                            </h6>
                          </div>
                          <div className="card-body text-center">
                            <p>Biểu đồ thống kê sẽ hiển thị tại đây...</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-4 mb-4">
                        <div className="card">
                          <div className="card-header py-3 d-flex justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">
                              Bài viết gần đây
                            </h6>
                          </div>
                          <div className="card-body">
                            <ul className="list-unstyled mb-0">
                              <li><span className="text-dark">• Tin tức công nghệ 2025</span></li>
                              <li><span className="text-dark">• AI trong lĩnh vực y tế</span></li>
                              <li><span className="text-dark">• Xu hướng báo chí điện tử</span></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                }
              />

              {/* Danh sách bài viết */}
              <Route path="articles" element={<ArticlesList />} />

              {/* Thêm bài viết */}
              <Route path="articles/add" element={<AddArticle />} />
              {/* ===== DANH MỤC ===== */}
              <Route path="categories" element={<CategoriesList />} />

              {/*  Quản lý bình luận */}
              <Route path="comments" element={<CommentsList />} />

              <Route path="users" element={<UsersList />} />

                {/* <Route path="/pending-articles" element={<PendingArticles />} /> */}
            </Routes>
          </div>
        </div>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminDashboard;

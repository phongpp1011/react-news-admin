import React from "react";

function AdminSidebar() {
  return (
    <ul className="navbar-nav sidebar sidebar-light accordion" id="accordionSidebar">
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
        <div className="sidebar-brand-text mx-3">News Admin</div>
      </a>

      <hr className="sidebar-divider my-0" />

      {/* <li className="nav-item active">
        <a className="nav-link" href="/admin">
          <span>Dashboard</span>
        </a>
      </li> */}

      {/* <hr className="sidebar-divider" />
      <div className="sidebar-heading">Quản lý</div> */}

      {/* Quản lý bài viết */}
      <li className="nav-item">
        <a className="nav-link" href="/admin/articles">
          <span>Danh sách bài viết</span>
        </a>
      </li>

      {/*  Thêm bài viết mới */}
      <li className="nav-item">
        <a className="nav-link" href="/admin/articles/add">
          <span>Thêm bài viết</span>
        </a>
      </li>

      <li className="nav-item">
        <a className="nav-link" href="/admin/users">
          <span>Người dùng</span>
        </a>
      </li>

      <li className="nav-item">
        <a className="nav-link" href="/admin/comments">
          <span>Bình luận</span>
        </a>
      </li>

      <hr className="sidebar-divider" />
      <div className="sidebar-heading">Hệ thống</div>

      <li className="nav-item">
        <a className="nav-link" href="/admin/settings">
          <span>Cài đặt</span>
        </a>
      </li>
    </ul>
  );
}

export default AdminSidebar;

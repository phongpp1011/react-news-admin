import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page, categoryFilter, search]);

  const fetchCategories = () => {
    axios
      .get("http://localhost:8081/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories);
      })
      .catch((err) => console.error("Lỗi API:", err));
  };

  const fetchArticles = (pageNumber) => {
    axios
      .get("http://localhost:8081/admin/articles", {
        params: {
          page: pageNumber,
          search,
          category: categoryFilter,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setArticles(res.data.articles);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err) => console.error(err));
  };

  const deleteArticle = (id) => {
    if (!window.confirm("Bạn chắc muốn xóa bài viết này?")) return;
    axios.delete(`http://localhost:8081/articles/${id}`).then((res) => {
      if (res.data.success) fetchArticles(page);
    });
  };

  const getImageUrl = (img) =>
    !img
      ? "/noimage.png"
      : img.startsWith("http")
      ? img
      : `http://localhost:8081${img}`;

  return (
    <div className="container mt-4">
      {/* Header + Add button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quản lý bài viết</h2>
        <Link to="/admin/articles/add" className="btn btn-primary">
          + Thêm bài viết
        </Link>
      </div>

      {/* Search + Category Filter */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            placeholder=" Tìm theo tiêu đề..."
            className="form-control"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value=""> Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered align-middle">
        <thead className="table-dark text-center">
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Lượt xem</th>
            <th>Trạng thái</th>
            <th>Ngày đăng</th>
            <th style={{ width: "130px" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {articles.length > 0 ? (
            articles.map((item) => (
              <tr key={item.id}>
                <td className="text-center">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    style={{
                      width: "80px",
                      height: "55px",
                      borderRadius: "5px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{item.title}</td>
                <td>{item.category_name || "—"}</td>
                <td className="text-center">{item.views || 0}</td>
                <td className="text-center">
                  <span
                    className={`badge ${
                      item.status === "published" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="text-center">
                  {item.published_at &&
                    new Date(item.published_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="text-center">
                  <Link
                    to={`/admin/articles/edit/${item.id}`}
                    className="btn btn-warning btn-sm me-2"
                  >
                    Sửa
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteArticle(item.id)}
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-3 text-muted">
                Không có bài viết
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <button
            className="btn btn-outline-dark"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Trang trước
          </button>
          <span className="fw-bold">
            Trang {page}/{totalPages}
          </span>
          <button
            className="btn btn-outline-dark"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
          >
            Trang sau 
          </button>
        </div>
      )}
    </div>
  );
}

export default ArticlesList;

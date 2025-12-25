import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]); // danh sách sau khi lọc
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  // Lọc realtime khi search thay đổi
  useEffect(() => {
  let result = articles;

  // Lọc theo tiêu đề
  if (search.trim()) {
    result = result.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Lọc theo trạng thái
  if (statusFilter !== "all") {
    result = result.filter(item => item.status === statusFilter);
  }

  setFiltered(result);
}, [search, statusFilter, articles]);


  const fetchArticles = async (pageNumber) => {
    try {
      const res = await axios.get(
        `http://localhost:8081/admin/articles?page=${pageNumber}`
      );

      if (res.data.success) {
        setArticles(res.data.articles);
        setFiltered(res.data.articles); // load ban đầu
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Lỗi API:", err);
    }
  };

  const deleteArticle = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này không?")) return;

    try {
      const res = await axios.delete(`http://localhost:8081/articles/${id}`);
      if (res.data.success) {
        alert("Xóa bài viết thành công!");
        fetchArticles(page);
      }
    } catch (err) {
      alert("Lỗi khi xóa bài viết!");
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Sử dụng route admin để update (bảo đảm quyền)
      await axios.put(`http://localhost:8081/admin/articles/${id}`, {
        status: newStatus,
      });

      alert("Cập nhật trạng thái thành công!");
      fetchArticles(page);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn duyệt và xuất bản bài này?")) return;
    try {
      const res = await axios.put(`http://localhost:8081/admin/articles/approve/${id}`);
      if (res.data.success) {
        alert(res.data.message || "Đã duyệt bài");
        fetchArticles(page);
      } else {
        alert(res.data.message || "Duyệt thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi duyệt bài:", err);
      alert("Lỗi khi duyệt bài");
    }
  };

  const getImageUrl = (img) =>
    img ? `http://localhost:8081${img}` : "/noimage.png";

  // helper hiển thị badge màu theo trạng thái
  const renderStatusBadge = (status) => {
    const map = {
      pending: { label: "Chờ duyệt", className: "badge bg-warning text-dark" },
      draft: { label: "Bản nháp", className: "badge bg-secondary" },
      published: { label: "Xuất bản", className: "badge bg-success" },
    };
    const v = map[status] || { label: status, className: "badge bg-light text-dark" };
    return <span className={v.className}>{v.label}</span>;
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/admin")}
      >
        Quay lại Admin
      </button>

      <button
        className="btn btn-success mb-3 ms-2"
        onClick={() => {
          axios.get("http://localhost:8081/aggregate/rss")
            .then(res => alert("Đã tổng hợp " + res.data.count + " bài!"))
            .catch(() => alert("Lỗi khi tổng hợp tin tức!"));
        }}
      >
        Tổng hợp bài từ các nguồn khác
      </button>

      <h2>Quản lý bài viết</h2>

      {/*  Thanh tìm kiếm realtime */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm bài viết theo tiêu đề..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
     <div className="mb-3">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
        </select>
      </div>
 

      <div className="text-end mb-3">
        <Link to="/admin/articles/add" className="btn btn-primary">
          Thêm bài viết
        </Link>
      </div>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>Danh mục</th>
            <th>Lượt xem</th>
            <th>Trạng thái</th>
            <th>Ngày đăng</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td style={{ width: "90px" }}>
                <img
                  src={getImageUrl(item.image)}
                  style={{
                    width: "80px",
                    height: "55px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </td>

              <td>{item.title}</td>
              <td>{item.category_name || "—"}</td>
              <td>{item.views}</td>

              <td>
                
                  {renderStatusBadge(item.status)}
                  
              </td>

              <td>
                {item.published_at ? new Date(item.published_at).toLocaleDateString("vi-VN") : (new Date(item.created_at).toLocaleDateString("vi-VN"))}
              </td>

              <td>
                <Link
                  to={`/admin/articles/edit/${item.id}`}
                  className="btn btn-warning btn-sm me-2"
                >
                  Sửa
                </Link>

                <button
                  className="btn btn-danger btn-sm me-2"
                  onClick={() => deleteArticle(item.id)}
                >
                  Xóa
                </button>

                {item.status === "pending" && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(item.id)}
                  >
                    Duyệt
                  </button>
                )}
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                Không tìm thấy bài viết phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-outline-dark"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Trang trước
        </button>

        <span>
          Trang {page} / {totalPages}
        </span>

        <button
          className="btn btn-outline-dark"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}

export default ArticlesList;

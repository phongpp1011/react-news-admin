import React, { useEffect, useState } from "react";
import axios from "axios";

// =======================
// HIGHLIGHT SPAM KEYWORDS
// =======================
function highlightSpam(text) {
  if (!text) return text;

  const keywords = [
    "khuyến mãi",
    "giảm giá",
    "vay tiền",
    "casino",
    "lô đề",
    "baccarat",
    "tool",
    "hack",
  ];

  let result = text;

  keywords.forEach((kw) => {
    const regex = new RegExp(kw, "gi");
    result = result.replace(
      regex,
      `<span style="color:red; font-weight:bold">${kw}</span>`
    );
  });

  return result;
}

function CommentsList() {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load danh sách khi đổi page hoặc search
  useEffect(() => {
    fetchComments();
  }, [page, search]);

  // =======================
  // FETCH COMMENTS
  // =======================
  const fetchComments = () => {
    setLoading(true);

    axios
      .get(`http://localhost:8081/admin/comments?page=${page}&q=${search}`)
      .then((res) => {
        if (res.data.success) {
          setComments(res.data.comments);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err) => console.error("Lỗi API:", err))
      .finally(() => setLoading(false));
  };

  // =======================
  // UPDATE STATUS
  // =======================
  const updateStatus = (id, newStatus) => {
    axios
      .put(`http://localhost:8081/admin/comments/status/${id}`, {
        status: newStatus,
      })
      .then((res) => {
        if (res.data.success) fetchComments();
      })
      .catch(() => alert("Lỗi khi cập nhật trạng thái!"));
  };

  // =======================
  // DELETE COMMENT
  // =======================
  const deleteComment = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;

    axios
      .delete(`http://localhost:8081/comments/${id}`)
      .then((res) => {
        if (res.data.success) {
          alert("Đã xóa bình luận!");
          fetchComments();
        } else {
          alert(res.data.message || "Xóa thất bại!");
        }
      })
      .catch(() => alert("Lỗi API khi xóa bình luận!"));
  };

  const prevPage = () => page > 1 && setPage(page - 1);
  const nextPage = () => page < totalPages && setPage(page + 1);

  return (
    <div className="container mt-4">
      <h2>Quản lý bình luận</h2>

      {/* SEARCH */}
      <input
        type="text"
        className="form-control w-50 mb-3"
        placeholder="Tìm email / nội dung / trạng thái..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Bài viết</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : comments.length > 0 ? (
              comments.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">{item.id}</td>
                  <td>{item.user_email}</td>
                  <td>{item.article_title || "Không xác định"}</td>

                  {/* Nội dung có highlight spam */}
                  <td
                    style={{ maxWidth: "250px", whiteSpace: "pre-wrap" }}
                    dangerouslySetInnerHTML={{
                      __html: highlightSpam(item.content),
                    }}
                  />

                  {/* STATUS DROPDOWN */}
                  <td className="text-center">
                    <select
                      className={`form-select form-select-sm ${
                        item.status === "approved"
                          ? "text-success"
                          : item.status === "pending"
                          ? "text-warning"
                          : "text-danger"
                      }`}
                      value={item.status}
                      onChange={(e) =>
                        updateStatus(item.id, e.target.value)
                      }
                    >
                      <option value="approved">Đã duyệt</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="spam">Spam</option>
                    </select>
                  </td>

                  <td className="text-center">
                    {new Date(item.created_at).toLocaleString("vi-VN")}
                  </td>

                  <td className="text-center">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteComment(item.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  Không có bình luận nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-dark"
            onClick={prevPage}
            disabled={page === 1}
          >
            Trang trước
          </button>

          <span>
            Trang <strong>{page}</strong> / {totalPages}
          </span>

          <button
            className="btn btn-outline-dark"
            onClick={nextPage}
            disabled={page === totalPages}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentsList;

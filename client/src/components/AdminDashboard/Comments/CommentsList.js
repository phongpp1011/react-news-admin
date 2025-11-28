import React, { useEffect, useState } from "react";
import axios from "axios";

function CommentsList() {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  //  Gọi API khi trang hoặc từ khóa thay đổi
  useEffect(() => {
    fetchComments();
  }, [page, search]);

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


  //  Xóa bình luận
  const deleteComment = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này không?")) return;

    axios
      .delete(`http://localhost:8081/comments/${id}`)
      .then((res) => {
        if (res.data.success) {
          alert("Đã xóa bình luận!");
          fetchComments();
        }
      })
      .catch(() => alert("Lỗi khi xóa bình luận!"));
  };

  //  Phân trang
  const prevPage = () => page > 1 && setPage(page - 1);
  const nextPage = () => page < totalPages && setPage(page + 1);

  return (
    <div className="container mt-4">
      <h2>Quản lý bình luận</h2>

      {/*  Thanh tìm kiếm */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Tìm theo email hoặc bài viết..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/*  Bảng bình luận */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Bài viết</th>
              <th>Nội dung</th>
              <th>Ngày tạo</th>
              <th style={{ width: "100px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : comments.length > 0 ? (
              comments.map((item) => (
                <tr key={item.id}>
                  <td className="text-center">{item.id}</td>
                  <td>{item.user_email}</td>
                  <td>{item.article_title || "Không xác định"}</td>
                  <td>{item.content}</td>
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
                <td colSpan="6" className="text-center text-muted py-4">
                  Không có bình luận nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/*  Phân trang */}
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

import React, { useEffect, useState } from "react";
import axios from "axios";

function PendingArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/admin/articles?status=pending");
      if (res.data.success) setArticles(res.data.articles);
    } catch (err) {
      console.error("Lỗi load pending:", err);
    }
    setLoading(false);
  };

  const approveArticle = async (id) => {
    if (!window.confirm("Duyệt bài này?")) return;

    try {
      const res = await axios.put(`http://localhost:5000/admin/articles/approve/${id}`);
      if (res.data.success) {
        alert("Duyệt thành công!");
        loadPending(); // load lại danh sách
      } else {
        alert(res.data.message || "Lỗi khi duyệt");
      }
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="pending-articles">
      <h2> Bài viết chờ duyệt</h2>

      {articles.length === 0 ? (
        <p>Không có bài nào đang chờ duyệt.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Tác giả</th>
              <th>Ngày tạo</th>
              <th>Duyệt</th>
            </tr>
          </thead>

          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.title}</td>
                <td>{a.category_name || "Không rõ"}</td>
                <td>{a.author_email}</td>
                <td>{a.created_at?.slice(0, 10)}</td>
                <td>
                  <button
                    onClick={() => approveArticle(a.id)}
                    style={{
                      padding: "6px 12px",
                      background: "green",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      borderRadius: "5px",
                    }}
                  >
                    Duyệt ✔
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PendingArticles;

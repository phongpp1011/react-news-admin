import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Bình luận
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // Lấy user email từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "Khách";

  // Xử lý ảnh
  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `http://localhost:8081${img}`;

  // ==============================
  //    LẤY THÔNG TIN BÀI VIẾT
  // ==============================
  useEffect(() => {
    let didCancel = false;

    const fetchArticle = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/articles/${slug}`);
        if (!didCancel && res.data.success) {
          setArticle(res.data.article);

          // Tăng view 1 lần duy nhất khi mở trang
          await axios.post(`http://localhost:8081/articles/increase-view`, {
            slug,
          });

          // Cập nhật local article view để UI hiển thị ngay
          setArticle((prev) => ({
            ...prev,
            views: prev.views + 1,
          }));
        } else if (!didCancel) {
          setArticle(null);
        }
      } catch (err) {
        console.error("Lỗi khi tải bài viết:", err);
        if (!didCancel) setArticle(null);
      } finally {
        if (!didCancel) setLoading(false);
      }
    };

    fetchArticle();

    return () => {
      didCancel = true; // tránh cập nhật state sau khi unmount
    };
  }, [slug]);

  // ==============================
  //     LẤY BÌNH LUẬN THEO ID
  // ==============================
  useEffect(() => {
    if (!article?.id) return;
    axios
      .get(`http://localhost:8081/comments/${article.id}`)
      .then((res) => {
        if (res.data.success) setComments(res.data.comments);
      })
      .catch(() => console.error("Lỗi khi tải bình luận"));
  }, [article]);

  // ==============================
  //       GỬI BÌNH LUẬN
  // ==============================
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return alert("Vui lòng nhập bình luận!");

    try {
      const res = await axios.post("http://localhost:8081/comments", {
        article_id: article.id,
        user_email: userEmail,
        content: newComment,
      });

      if (res.data.success) {
        setNewComment("");

        // Reload comments
        const reload = await axios.get(
          `http://localhost:8081/comments/${article.id}`
        );
        if (reload.data.success) setComments(reload.data.comments);
      }
    } catch (err) {
      console.error("Lỗi khi gửi bình luận:", err);
    }
  };

  // ==============================
  //    ĐỌC BÀI VIẾT (VIỆT NAM)
  // ==============================
  const handleRead = () => {
    if (!article) return;

    const fullText =
      article.title +
      ". " +
      article.excerpt +
      ". " +
      article.content.replace(/<[^>]+>/g, " ");

    const speech = new SpeechSynthesisUtterance(fullText);

    speech.lang = "vi-VN"; // giọng tiếng Việt
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

  // ==============================
  //       UI LOADING + ERROR
  // ==============================
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Bài viết không tồn tại hoặc đã bị xóa.</p>
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    );
  }

  // ==============================
  //       GIAO DIỆN CHÍNH
  // ==============================
  return (
    <section className="article-detail-area py-5">
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary mb-4"
          style={{ borderRadius: "20px", fontSize: "14px", padding: "6px 16px" }}
        >
          Quay lại
        </button>

        {/* Nút nghe bài viết */}
        <div className="mb-3">
          <button className="btn btn-primary me-2" onClick={handleRead}>
            Nghe bài viết
          </button>
          <button className="btn btn-danger" onClick={handleStop}>
            Dừng đọc
          </button>
        </div>

        <div className="article-content">
          <p className="text-danger fw-semibold mb-1">
            {getCategoryName(article.category_id)} •{" "}
            <span className="text-muted small">
              {new Date(article.published_at).toLocaleTimeString("vi-VN")}{" "}
              {new Date(article.published_at).toLocaleDateString("vi-VN")}
            </span>{" "}
            • {article.views} lượt xem
          </p>

          <h2 className="fw-bold mb-3">{article.title}</h2>
          <p className="lead text-secondary mb-4">{article.excerpt}</p>

          <div className="text-center mb-4">
            <img
              src={getImageUrl(article.image)}
              alt={article.title}
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: "550px", width: "100%", objectFit: "cover" }}
            />
          </div>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{ fontSize: "18px", lineHeight: "1.8", color: "#333" }}
          ></div>

          <hr className="my-4" />
          <p className="text-muted fst-italic">
            Tác giả:{" "}
            <span className="fw-semibold">{article.author || "Không rõ"}</span>
          </p>
        </div>

        {/* ==============================
                     BÌNH LUẬN
        ============================== */}
        <div className="comments-section mt-5">
          <h4>Bình luận ({comments.length})</h4>

          <form onSubmit={handleCommentSubmit} className="mb-4">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Nhập bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>
            <button type="submit" className="btn btn-primary mt-2">
              Gửi bình luận
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-muted">Chưa có bình luận nào.</p>
          ) : (
            comments.map((cmt) => (
              <div key={cmt.id} className="border rounded p-3 mb-2">
                <p className="fw-bold mb-1">{cmt.user_email || "Ẩn danh"}</p>
                <p className="mb-1">{cmt.content}</p>
                <small className="text-muted">
                  {new Date(cmt.created_at).toLocaleString("vi-VN")}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

// Mapping danh mục
function getCategoryName(id) {
  const mapping = {
    1: "Chính trị",
    2: "Thể thao",
    3: "Giải trí",
    4: "Công nghệ",
    5: "Kinh tế",
    6: "Đời sống",
    7: "Môi trường",
  };
  return mapping[id] || "Tin tức";
}

export default ArticleDetail;

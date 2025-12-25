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

  // Bình luận
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [activeReply, setActiveReply] = useState(null);

  // Filter
  const [filter, setFilter] = useState("all");

  // User
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "Khách";

  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `http://localhost:8081${img}`;

  // ============================
  //        LẤY BÀI VIẾT
  // ============================
  useEffect(() => {
    let stop = false;

    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/articles/${slug}`);
        if (!stop && res.data.success) {
          setArticle(res.data.article);

          await axios.post(`http://localhost:8081/articles/increase-view`, {
            slug,
          });

          setArticle((prev) => ({
            ...prev,
            views: prev.views + 1,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!stop) setLoading(false);
      }
    };

    fetch();
    return () => (stop = true);
  }, [slug]);

  // ============================
  //        LẤY BÌNH LUẬN
  // ============================
  const loadComments = () => {
    if (!article?.id) return;

    axios
      .get(
        `http://localhost:8081/comments/${article.id}${
          filter === "new" ? "?sort=new" : ""
        }`
      )
      .then((res) => res.data.success && setComments(res.data.comments));
  };

  useEffect(() => {
    loadComments();
  }, [article, filter]);

  // ============================
  //        GỬI BÌNH LUẬN
  // ============================
  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await axios.post("http://localhost:8081/comments", {
      article_id: article.id,
      user_email: userEmail,
      content: newComment,
    });

    setNewComment("");
    loadComments();
  };

  // ============================
  //        GỬI TRẢ LỜI
  // ============================
  const submitReply = async (parentId) => {
    if (!replyContent.trim()) return;

    await axios.post("http://localhost:8081/comments/reply", {
      article_id: article.id,
      parent_id: parentId,
      user_email: userEmail,
      content: replyContent,
    });

    setReplyContent("");
    setActiveReply(null);
    loadComments();
  };

  // ============================
  //      LIKE / DISLIKE
  // ============================
  const handleLike = async (id) => {
    await axios.post("http://localhost:8081/comments/like", { id });
    loadComments();
  };

  const handleDislike = async (id) => {
    await axios.post("http://localhost:8081/comments/dislike", { id });
    loadComments();
  };

  // ============================
  //     ĐỌC BÀI VIẾT
  // ============================
  const readArticle = () => {
    const full =
      article.title +
      ". " +
      article.excerpt +
      ". " +
      article.content.replace(/<[^>]+>/g, " ");

    const sp = new SpeechSynthesisUtterance(full);
    sp.lang = "vi-VN";
    sp.rate = 1;
    window.speechSynthesis.speak(sp);
  };

  const stopRead = () => window.speechSynthesis.cancel();

  // ============================
  //       UI LOADING / ERROR
  // ============================
  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  if (!article)
    return (
      <div className="text-center py-5">
        <p>Bài viết không tồn tại.</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline-dark">
          Quay lại
        </button>
      </div>
    );

  // ==================================================
  //               UI CHÍNH
  // ==================================================
  return (
    <section className="py-5">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-secondary mb-4"
          style={{ borderRadius: 20 }}
        >
           Quay lại
        </button>

        {/* NGHE BÀI VIẾT */}
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-danger" onClick={readArticle}>
            Nghe bài viết
          </button>
          <button className="btn btn-dark" onClick={stopRead}>
            Dừng
          </button>
        </div>

        {/* TIÊU ĐỀ */}
        <h1 className="fw-bold mb-3" style={{ fontSize: "2.2rem" }}>
          {article.title}
        </h1>

        {/* NGÀY & VIEW */}
        <div className="text-muted mb-4">
          {new Date(article.published_at).toLocaleString("vi-VN")} •{" "}

          <span
            className="badge bg-secondary mx-1"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/category/${article.category_slug}`)}
            title="Xem các bài viết cùng danh mục"
          >
            {article.category_name}
          </span>


          • <b>{article.views}</b> lượt xem
        </div>




        <p className="lead text-secondary mb-4">{article.excerpt}</p>

        {/* ẢNH LỚN */}
        <div className="text-center mb-4">
          <img
            src={getImageUrl(article.image)}
            className="img-fluid rounded shadow-sm"
            style={{ width: "100%", maxHeight: 520, objectFit: "cover" }}
          />
        </div>

        {/* NỘI DUNG */}
        <div
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{ fontSize: 19, lineHeight: "1.9" }}
        ></div>

        {/* TÁC GIẢ */}
        <hr />
        <p className="text-muted fst-italic">
          Tác giả: <b>{article.author || "Không rõ"}</b>
        </p>

        {/* ============================================
                      BÌNH LUẬN
        ============================================= */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold">Bình luận ({comments.length})</h4>

            {/* FILTER */}
            <select
              className="form-select"
              style={{ width: 180, borderRadius: 12 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả bình luận</option>
              <option value="new">Mới nhất</option>
            </select>
          </div>

          {/* FORM BÌNH LUẬN */}
          <form onSubmit={submitComment} className="mb-4">
            <textarea
              rows="3"
              className="form-control"
              placeholder="Nhập bình luận..."
              style={{ borderRadius: 12 }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            ></textarea>

            <button className="btn btn-primary mt-2 px-4 rounded-pill">
              Gửi bình luận
            </button>
          </form>

          {/* LIST BÌNH LUẬN */}
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              activeReply={activeReply}
              setActiveReply={setActiveReply}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              submitReply={submitReply}
              handleLike={handleLike}
              handleDislike={handleDislike}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// =====================================================
// COMPONENT COMMENT ITEM (HỖ TRỢ REPLY CẤP 1)
// =====================================================
function CommentItem({
  comment,
  activeReply,
  setActiveReply,
  replyContent,
  setReplyContent,
  submitReply,
  handleLike,
  handleDislike,
}) {
  return (
    <div
      className="p-3 mb-3 shadow-sm bg-white"
      style={{ borderRadius: 14, border: "1px solid #eee" }}
    >
      <b>{comment.user_email}</b>

      <p className="mb-1" style={{ fontSize: 16 }}>
        {comment.content}
      </p>

      <small className="text-muted">
        {new Date(comment.created_at).toLocaleString("vi-VN")}
      </small>

      {/* LIKE / DISLIKE */}
      <div className="mt-2 d-flex gap-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleLike(comment.id)}
        >
          Thích ({comment.likes})
        </button>

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDislike(comment.id)}
        >
          Không thích ({comment.dislikes})
        </button>

        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() =>
            setActiveReply(activeReply === comment.id ? null : comment.id)
          }
        >
          Trả lời
        </button>
      </div>

      {/* FORM REPLY */}
      {activeReply === comment.id && (
        <div className="mt-3">
          <textarea
            className="form-control"
            rows="2"
            style={{ borderRadius: 10 }}
            placeholder="Nhập trả lời..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          ></textarea>

          <button
            className="btn btn-primary btn-sm mt-2 rounded-pill"
            onClick={() => submitReply(comment.id)}
          >
            Gửi trả lời
          </button>
        </div>
      )}

      {/* Danh sách replies */}
      {comment.replies &&
        comment.replies.map((r) => (
          <div
            key={r.id}
            className="mt-3 ms-4 p-2 bg-light border rounded"
            style={{ borderRadius: 12 }}
          >
            <b>{r.user_email}</b>
            <p className="mb-1">{r.content}</p>
            <small className="text-muted">
              {new Date(r.created_at).toLocaleString("vi-VN")}
            </small>
          </div>
        ))}
    </div>
  );
}

// =====================================================
//       DANH MỤC
// =====================================================
// function getCategoryName(id) {
//   const list = {
//     1: "Công Nghệ",
//     2: "Kinh Tế",
//     3: "Y Tế",
//     4: "Giải trí",
//     5: "Chính Trị",
//     6: "Đời sống",
//     7: "Môi trường",
//   };
//   return list[id] || "Tin tức";
// }

export default ArticleDetail;

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

  const getImageUrl = (img) =>
    img?.startsWith("http") ? img : `http://localhost:8081${img}`;

  useEffect(() => {
    axios
      .get(`http://localhost:8081/articles/${slug}`)
      .then((res) => {
        if (res.data.success) setArticle(res.data.article);
        else setArticle(null);
      })
      .catch((err) => console.error("Lỗi khi tải bài viết:", err))
      .finally(() => setLoading(false));
  }, [slug]);

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
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

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

      </div>
    </section>
  );
}

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

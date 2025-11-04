import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function CategoryPage() {
  const { slug } = useParams(); // lấy slug từ URL
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Gọi API lấy thông tin danh mục + bài viết
    axios
      .get(`http://localhost:8081/category/${slug}`)
      .then((res) => {
        if (res.data.success) {
          setCategory(res.data.category);
          setArticles(res.data.articles);
        } else {
          setCategory(null);
        }
      })
      .catch((err) => console.error("Lỗi khi tải danh mục:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );

  if (!category)
    return (
      <div className="container text-center py-5">
        <h4>Danh mục không tồn tại hoặc đã bị xóa.</h4>
      </div>
    );

  return (
    <div className="category-page container py-5">
      {/* Tiêu đề danh mục */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-uppercase">{category.name}</h2>
        <p className="text-muted">{category.description}</p>
        <hr />
      </div>

      {/* Danh sách bài viết */}
      <div className="row g-4">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="col-md-4 col-sm-6">
              <div
                className="card shadow-sm border-0 h-100"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/article/${article.slug}`)}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="card-img-top"
                  style={{ height: "220px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{article.title}</h5>
                  <p className="card-text text-muted small mb-1">
                    {new Date(article.published_at).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="card-text text-truncate">{article.excerpt}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">Chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;

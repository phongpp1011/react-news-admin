import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function MainNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return "/default.jpg";
    return image.startsWith("http") ? image : `http://localhost:8081/${image.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get("http://localhost:8081/articles/main");
        if (res.data.success) setArticles(res.data.articles || []);
      } catch (err) {
        console.error("Lỗi khi tải main news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  if (articles.length === 0)
    return <p className="text-center text-muted py-5">Chưa có bài viết nào.</p>;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1);

  return (
    <section className="main-news-area pt-4 pb-4">
      <div className="container">
        <div className="row g-4">

          {/* ======= Cột bài phụ ======= */}
          <div className="col-lg-4 col-md-5">
            <div className="d-flex flex-column gap-4">

              {sideArticles.map((item) => (
                <Link
                  key={item.id}
                  to={`/article/${item.slug}`}
                  className="d-flex gap-3 text-decoration-none align-items-start side-news-item"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className="rounded"
                    style={{
                      width: 110,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  <div>
                    <h6 className="fw-semibold text-dark mb-1 hover-title">
                      {item.title}
                    </h6>
                    <span className="text-muted small">
                      {new Date(item.published_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </Link>
              ))}

            </div>
          </div>

          {/* ======= Bài chính ======= */}
          <div className="col-lg-8 col-md-7">
            <div className="main-article-card">
              <Link to={`/article/${mainArticle.slug}`}>
                <div className="main-article-image">
                  <img
                    src={getImageUrl(mainArticle.image)}
                    alt={mainArticle.title}
                    className="img-fluid"
                  />
                </div>
              </Link>

              <div className="p-3 pt-3">
                <Link
                  to={`/article/${mainArticle.slug}`}
                  className="text-decoration-none"
                >
                  <h2 className="main-title">{mainArticle.title}</h2>
                </Link>

                <p className="text-muted mt-2 fs-6">{mainArticle.excerpt}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default MainNews;

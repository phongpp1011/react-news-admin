import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function MainNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return "/default.jpg"; // ảnh mặc định nếu không có
    return image.startsWith("http") ? image : `http://localhost:8081/${image.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8081/articles/main"); // lấy 5 bài mới nhất từ DB
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
        <div className="row">

          <div className="col-lg-4 col-md-5">
            <div className="d-flex flex-column gap-3">
              {sideArticles.map((item) => (
                <Link key={item.id} to={`/article/${item.slug}`}
                  className="d-flex gap-3 text-decoration-none text-dark">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 4 }}
                  />
                  <p className="mb-0">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="col-lg-8 col-md-7 mt-3 mt-md-0">
            <div className="card border-0 shadow-sm">
              <Link to={`/article/${mainArticle.slug}`}>
                <img
                  src={getImageUrl(mainArticle.image)}
                  alt={mainArticle.title}
                  className="card-img-top"
                  style={{ height: 350, objectFit: "cover" }}
                />
              </Link>
              <div className="card-body">
                <h5>
                  <Link to={`/article/${mainArticle.slug}`} className="text-dark text-decoration-none">
                    {mainArticle.title}
                  </Link>
                </h5>
                <p className="text-muted small">{mainArticle.excerpt}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default MainNews;

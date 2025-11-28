import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function WhatsNew() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm xử lý mọi loại ảnh: RSS URL hoặc ảnh local
  const getImageUrl = (image) => {
    if (!image || image === "null") return "/default.jpg";

    // Ảnh RSS có dạng http://... hoặc https://...
    if (image.startsWith("http://") || image.startsWith("https://")) return image;

    // Ảnh local
    return `http://localhost:8081/${image.replace(/^\//, "")}`;
  };

  useEffect(() => {
    axios
      .get("http://localhost:8081/articles/latest")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.articles)) {
          setArticles(res.data.articles);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="pt-5 pb-5">
      <div className="container">
        <h3 className="mb-4">What’s New</h3>

        {/* Tránh hiện "chưa có bài viết" trước khi load xong */}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="row g-4">
            {articles.length === 0 ? (
              <p>Chưa có bài viết nào.</p>
            ) : (
              articles.map((news) => (
                <div key={news.id} className="col-xl-4 col-lg-4 col-md-6">
                  <Link
                    to={`/article/${news.slug}`}
                    className="text-dark text-decoration-none"
                  >
                    <div className="card shadow-sm border-0 h-100">
                      <img
                        src={getImageUrl(news.image)}
                        alt={news.title}
                        className="card-img-top"
                        style={{ height: 220, objectFit: "cover" }}
                        onError={(e) => (e.target.src = "/default.jpg")}
                      />

                      <div className="card-body">
                        <h5 className="card-title">{news.title}</h5>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default WhatsNew;

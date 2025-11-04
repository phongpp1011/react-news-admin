import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResult() {
  const query = useQuery();
  const keyword = query.get("q");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!keyword) return;
    console.log("🔍 Gửi yêu cầu tìm kiếm:", keyword);

    axios
      .get(`http://localhost:8081/articles/search?q=${encodeURIComponent(keyword)}`)
      .then((res) => {
        if (res.data.success) setArticles(res.data.articles);
      })
      .catch((err) => console.error("Lỗi tìm kiếm:", err))
      .finally(() => setLoading(false));
  }, [keyword]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* 🔙 Nút quay lại */}
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
      </div>

      <h3>
        Kết quả tìm kiếm cho:{" "}
        <span className="text-danger">"{keyword}"</span>
      </h3>
      <hr />

      {articles.length > 0 ? (
        <div className="row g-4">
          {articles.map((a) => (
            <div key={a.id} className="col-md-4">
              <div className="card shadow-sm border-0 h-100">
                <img
                  src={a.image}
                  alt={a.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5>
                    <Link
                      to={`/article/${a.slug}`}
                      className="text-dark text-decoration-none"
                    >
                      {a.title}
                    </Link>
                  </h5>
                  <p className="text-muted small">
                    {new Date(a.published_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">
          Không tìm thấy bài viết nào phù hợp.
        </p>
      )}
    </div>
  );
}

export default SearchResult;

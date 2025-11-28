import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function WeeklyNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (image) => {
    if (!image) return "/default.jpg";

    // Nếu image là URL từ RSS thì giữ nguyên
    if (image.startsWith("http")) return image;

    // Nếu là ảnh local thì thêm domain server
    return `http://localhost:8081/${image.replace(/^\//, "")}`;
  };

  useEffect(() => {
    const fetchWeekly = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8081/articles/weekly");
        if (res.data.success) setArticles(res.data.articles || []);
      } catch (error) {
        console.log("Lỗi tải weekly:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekly();
  }, []);

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  if (articles.length === 0)
    return (
      <p className="text-center text-muted py-5">
        Chưa có bài viết nào trong tuần.
      </p>
    );

  return (
    <section className="pt-5 pb-5">
      <div className="container">
        <h3 className="mb-4">Weekly Highlights</h3>

        <div className="row g-4">
          {articles.map((item) => (
            <div key={item.id} className="col-md-4">
              <Link
                to={`/article/${item.slug}`}
                className="text-dark text-decoration-none"
              >
                <div className="card shadow-sm border-0">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    className="card-img-top"
                    style={{ height: 220, objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{item.title}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WeeklyNews;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function WeeklyNews() {
  const [articles, setArticles] = useState([]);

  const getImageUrl = (image) => {
    if (!image) return "/default.jpg";
    return `http://localhost:8081/${image.replace(/^\//, "")}`;
  };

  useEffect(() => {
    axios.get("http://localhost:8081/articles/weekly")
      .then(res => res.data.success && setArticles(res.data.articles));
  }, []);

  return (
    <section className="pt-5 pb-5">
      <div className="container">
        <h3 className="mb-4">Weekly Highlights</h3>

        <div className="row g-4">
          {articles.map((item) => (
            <div key={item.id} className="col-md-4">

              <Link to={`/article/${item.slug}`} className="text-dark text-decoration-none">
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

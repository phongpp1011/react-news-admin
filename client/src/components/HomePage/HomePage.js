import React from "react";
import Header from "./Header";
import TrendingNews from "./TrendingNews";
import MainNews from "./MainNews";
import WeeklyNews from "./WeeklyNews";
import WhatsNew from "./WhatsNew";
import Footer from "./Footer";
import "../../assets/css/bootstrap.min.css";
import "../../assets/css/style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function HomePage() {
  return (
    <div className="home-page">

      <Header />


      <TrendingNews />

      <MainNews />

      {/*  (tin nổi bật trong tuần) */}
      <WeeklyNews />

      {/*  (tin mới nhất) */}
      <WhatsNew />

      <Footer />
    </div>
  );
}

export default HomePage;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import Login from "./Login";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import ArticlesList from "./components/AdminDashboard/Articles/ArticlesList";
import AddArticle from "./components/AdminDashboard/Articles/AddArticle";
import ArticleDetail from "./components/ArticleDetail/ArticleDetail";
import CategoryPage from "./components/CategoryPage/CategoryPage";
import SearchResult from "./components/SearchResult/SearchResult";
import EditArticle from "./components/AdminDashboard/Articles/EditArticle";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// 🔹 Hàm đọc role an toàn
function safeGetRole() {
  const raw = localStorage.getItem("role");
  if (!raw || raw === "null" || raw === "undefined") return null;
  return raw;
}

function App() {
  const [role, setRole] = useState(null);
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);

  useEffect(() => {
    const storedRole = safeGetRole();
    setRole(storedRole);
    setIsRoleLoaded(true);
  }, []);

  if (!isRoleLoaded) return null;

  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/search" element={<SearchResult />} />

        {/* ✅ Login kiểm tra role */}
        <Route
          path="/login"
          element={
            role === null ? (
              <Login setRole={setRole} />
            ) : role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* ✅ Admin Protected Routes */}
        <Route
          path="/admin/*"
          element={
            role === "admin" ? (
              <AdminDashboard setRole={setRole} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ✅ Child Routes của Admin */}
        <Route
          path="/admin/articles"
          element={
            role === "admin" ? <ArticlesList /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/articles/add"
          element={
            role === "admin" ? <AddArticle /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin/articles/edit/:id"
          element={role === "admin" ? <EditArticle /> : <Navigate to="/login" replace />}
        />


        {/* ✅ 404 → Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

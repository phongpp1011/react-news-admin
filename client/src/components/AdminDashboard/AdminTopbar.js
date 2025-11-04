import React from "react";
import { useNavigate } from "react-router-dom";

function AdminTopbar({ setRole }) {
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userEmail = user?.email || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    if (setRole) setRole(null);

    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-navbar topbar mb-4 static-top shadow">
      <button className="btn btn-link rounded-circle mr-3">
        &#9776;
      </button>

      <ul className="navbar-nav ml-auto">
        <li
          className="nav-item d-flex align-items-center text-black fw-bold"
          style={{ fontSize: "16px" }}
        >
          Xin chào, {userEmail}
        </li>

        <li className="nav-item ml-3">
          <button
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default AdminTopbar;

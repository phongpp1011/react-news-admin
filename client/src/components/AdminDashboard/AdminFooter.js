import React from "react";

function AdminFooter() {
  return (
    <footer className="sticky-footer bg-white mt-auto">
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          <span>
            © {new Date().getFullYear()}  <b>Phong</b>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;

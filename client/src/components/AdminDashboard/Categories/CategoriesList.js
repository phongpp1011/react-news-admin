import React, { useEffect, useState } from "react";
import axios from "axios";

function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get("http://localhost:8081/admin/categories");
    setCategories(res.data);
  };

  const resetForm = () => {
    setForm({ id: null, name: "", slug: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.slug) {
      alert("Tên và slug không được để trống!");
      return;
    }

    if (form.id) {
      // ✏️ UPDATE
      await axios.put(
        `http://localhost:8081/admin/categories/${form.id}`,
        form
      );
      alert("Cập nhật danh mục thành công!");
    } else {
      // ➕ CREATE
      await axios.post("http://localhost:8081/admin/categories", form);
      alert("Thêm danh mục thành công!");
    }

    resetForm();
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setForm(cat);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    await axios.delete(`http://localhost:8081/admin/categories/${id}`);
    alert("Xóa danh mục thành công!");
    fetchCategories();
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Quản lý danh mục</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Tên danh mục"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Slug (vd: cong-nghe)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>

          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Mô tả"
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-2">
          <button className="btn btn-primary me-2">
            {form.id ? "Cập nhật" : "Thêm danh mục"}
          </button>
          {form.id && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* TABLE */}
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Slug</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.name}</td>
              <td>{cat.slug}</td>
              <td>{cat.description || "—"}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => handleEdit(cat)}
                >
                  Sửa
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(cat.id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Chưa có danh mục
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriesList;

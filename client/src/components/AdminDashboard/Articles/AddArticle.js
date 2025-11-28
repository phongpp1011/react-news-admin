import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function AddArticle({ userEmail }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState(EditorState.createEmpty());
  const [image, setImage] = useState(""); // đường dẫn server
  const [preview, setPreview] = useState(null); // preview ảnh
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8081/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiển thị preview trước khi upload
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload file
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:8081/upload", formData);
      if (res.data.success) setImage(res.data.filePath);
    } catch (err) {
      console.error("Upload lỗi:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const htmlContent = draftToHtml(convertToRaw(content.getCurrentContent()));
      const res = await axios.post("http://localhost:8081/articles", {
        title,
        slug,
        excerpt,
        content: htmlContent,
        image,
        category_id: categoryId,
        status,
        author_email: userEmail, // gửi email tác giả
      });

      if (res.data.success) {
        alert("Thêm bài viết thành công!");
        navigate("/admin/articles");
      } else {
        alert("Lỗi khi thêm bài viết!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm bài viết:", err);
      alert("Lỗi khi thêm bài viết!");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Thêm bài viết mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Tiêu đề</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Slug (tùy chọn)</label>
          <input
            type="text"
            className="form-control"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Trích dẫn</label>
          <textarea
            className="form-control"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label>Nội dung</label>
          <Editor
            editorState={content}
            onEditorStateChange={setContent}
            wrapperClassName="wrapper-class"
            editorClassName="editor-class"
          />
        </div>

        <div className="mb-3">
          <label>Ảnh</label>
          <input type="file" className="form-control" onChange={handleImageChange} />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "200px", marginTop: "10px", borderRadius: "4px" }}
            />
          )}
        </div>

        <div className="mb-3">
          <label>Danh mục</label>
          <select
            className="form-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">— Chọn danh mục —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Trạng thái</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Thêm bài viết
        </button>
      </form>
    </div>
  );
}

export default AddArticle;

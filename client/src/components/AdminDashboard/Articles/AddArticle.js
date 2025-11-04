import React, { useState, useEffect } from "react";
import axios from "axios";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useNavigate } from "react-router-dom";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function AddArticle() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState(EditorState.createEmpty());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  //  Lấy danh sách danh mục từ DB
  useEffect(() => {
    axios
      .get("http://localhost:8081/categories")
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error(" Lỗi khi tải danh mục:", err));
  }, []);

  //  Upload ảnh lên server
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return alert(" Chưa chọn ảnh!");

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:8081/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setImage(`/uploads/${res.data.fileName}`);
      } else {
        alert(" Upload thất bại!");
      }
    } catch {
      alert(" Lỗi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  //  Submit thêm bài
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return alert(" Tiêu đề không được để trống!");
    if (!categoryId) return alert(" Vui lòng chọn danh mục!");
    if (!image) return alert(" Hãy tải ảnh bài viết!");

    setLoading(true);

    axios
      .post("http://localhost:8081/articles", {
        title,
        excerpt,
        image,
        category_id: categoryId,
        content: draftToHtml(convertToRaw(content.getCurrentContent())),
        status: "published",
      })
      .then((res) => {
        if (res.data.success) {
          alert(" Thêm bài viết thành công!");
          navigate("/admin/articles"); //  quay về trang danh sách
        } else {
          alert(res.data.message || " Không thêm được bài viết!");
        }
      })
      .catch((err) => {
        console.error(err);
        alert(" Lỗi khi thêm bài viết!");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="container mt-4">
      <h2> Thêm bài viết mới</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Tiêu đề */}
        <div className="mb-3">
          <label>Tiêu đề *</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Excerpt */}
        <div className="mb-3">
          <label>Mô tả ngắn</label>
          <textarea
            className="form-control"
            rows="2"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        {/* Upload image */}
        <div className="mb-3">
          <label>Ảnh bài viết *</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleUploadImage}
          />
          {uploading && <p className="text-warning"> Đang tải lên...</p>}

          {image && (
            <img
              src={`http://localhost:8081${image}`}
              alt="Preview"
              className="mt-2 rounded shadow-sm"
              style={{ width: "200px" }}
            />
          )}
        </div>

        {/* Category */}
        <div className="mb-3">
          <label>Danh mục *</label>
          <select
            className="form-control"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nội dung bài viết */}
        <div className="mb-3">
          <label>Nội dung *</label>
          <div className="border rounded p-2">
            <Editor
              editorState={content}
              onEditorStateChange={setContent}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? " Đang lưu..." : " Thêm bài viết"}
        </button>
      </form>
    </div>
  );
}

export default AddArticle;

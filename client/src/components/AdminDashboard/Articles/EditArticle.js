import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [contentEditor, setContentEditor] = useState(EditorState.createEmpty());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/articles/id/${id}`)
      .then((res) => {
        if (res.data.success) {
          const data = res.data.article;
          setArticle(data);

          if (data.content) {
            const blocksFromHTML = htmlToDraft(data.content);
            if (blocksFromHTML) {
              const { contentBlocks, entityMap } = blocksFromHTML;
              const newState = ContentState.createFromBlockArray(contentBlocks, entityMap);
              setContentEditor(EditorState.createWithContent(newState));
            }
          }
        }
      })
      .catch((err) => console.error("Lỗi API:", err));
  }, [id]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/categories")
      .then((res) => {
        if (res.data.success) setCategories(res.data.categories);
      })
      .catch((err) => console.error("Lỗi API danh mục:", err));
  }, []);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:8081/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setArticle({ ...article, image: `/uploads/${res.data.fileName}` });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedContent = draftToHtml(
      convertToRaw(contentEditor.getCurrentContent())
    );

    const updatedData = {
      ...article,
      content: updatedContent,
    };

    axios
      .put(`http://localhost:8081/articles/${id}`, updatedData)
      .then((res) => {
        if (res.data.success) {
          alert("Cập nhật thành công!");
          navigate("/admin/articles");
        }
      })
      .catch((err) => console.error("Lỗi cập nhật:", err));
  };

  if (!article) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;

  return (
    <div className="container mt-4">
      <h3>Sửa bài viết</h3>

      <form onSubmit={handleSubmit} className="mt-4">

        <div className="mb-3">
          <label>Tiêu đề</label>
          <input
            type="text"
            className="form-control"
            value={article.title || ""}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Slug</label>
          <input
            type="text"
            className="form-control"
            value={article.slug || ""}
            onChange={(e) => setArticle({ ...article, slug: e.target.value })}
          />
        </div>

        <div class-money="mb-3">
          <label>Danh mục</label>
          <select
            className="form-control"
            value={article.category_id || ""}
            onChange={(e) => setArticle({ ...article, category_id: e.target.value })}
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

        <div className="mb-3">
          <label>Tóm tắt</label>
          <textarea
            className="form-control"
            rows="2"
            value={article.excerpt || ""}
            onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Ảnh bài viết</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleUploadImage}
          />
          {uploading && <small className="text-warning">Đang tải ảnh...</small>}
          {article.image && (
            <img
              src={`http://localhost:8081${article.image}`}
              className="mt-2 rounded"
              style={{ width: "250px" }}
              alt="Preview"
            />
          )}
        </div>

        <div className="mb-3">
          <label>Nội dung</label>
          <div className="border rounded p-2">
            <Editor
              editorState={contentEditor}
              onEditorStateChange={setContentEditor}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-success">Lưu lại</button>
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={() => navigate("/admin/articles")}
        >
          Quay lại
        </button>
      </form>
    </div>
  );
}

export default EditArticle;

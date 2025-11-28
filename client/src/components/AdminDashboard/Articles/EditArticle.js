import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { EditorState, convertToRaw, ContentState, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy danh mục
  useEffect(() => {
    axios.get("http://localhost:8081/categories")
      .then(res => res.data.success && setCategories(res.data.categories));
  }, []);

  // Lấy dữ liệu bài viết
  useEffect(() => {
    axios.get(`http://localhost:8081/admin/articles/${id}`)
      .then(res => {
        if (res.data.success) {
          const article = res.data.article;
          setTitle(article.title || "");
          setSlug(article.slug || "");
          setExcerpt(article.excerpt || "");
          setImage(article.image || "");
          setCategoryId(article.category_id || "");
          setStatus(article.status || "draft");

          // EditorState từ HTML
          const blocksFromHtml = htmlToDraft(article.content || "");
          const { contentBlocks, entityMap } = blocksFromHtml;
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
          setEditorState(EditorState.createWithContent(contentState));

          setLoading(false);
        } else {
          alert(res.data.message || "Không tìm thấy bài viết!");
          navigate("/admin/articles");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Lỗi khi tải dữ liệu bài viết!");
        navigate("/admin/articles");
      });
  }, [id, navigate]);

  // Upload ảnh
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:8081/upload", formData);
      if (res.data.success) setImage(res.data.filePath);
    } catch (err) {
      console.error(err);
      alert("Upload ảnh thất bại!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const content = draftToHtml(convertToRaw(editorState.getCurrentContent()));

    const payload = { title, slug, excerpt, content, image, category_id: categoryId, status };

    try {
      const res = await axios.put(`http://localhost:8081/admin/articles/${id}`, payload);
      if (res.data.success) {
        alert("Cập nhật bài viết thành công!");
        navigate("/admin/articles");
      } else {
        alert(res.data.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật bài viết!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center py-5">Đang tải dữ liệu...</p>;

  return (
    <div className="container py-4">
      <h2>Sửa bài viết</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Tiêu đề:</label>
          <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label>Slug (tùy chọn):</label>
          <input type="text" className="form-control" value={slug} onChange={e => setSlug(e.target.value)} />
        </div>

        <div className="mb-3">
          <label>Excerpt (tóm tắt):</label>
          <textarea className="form-control" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>

        <div className="mb-3">
          <label>Nội dung:</label>
          <Editor
            editorState={editorState}
            onEditorStateChange={setEditorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
          />
        </div>

        <div className="mb-3">
          <label>Ảnh:</label>
          <input type="file" className="form-control" onChange={handleImageChange} />
          {image && <img src={`http://localhost:8081${image}`} alt="preview" style={{ width: 150, marginTop: 10 }} />}
        </div>

        <div className="mb-3">
          <label>Danh mục:</label>
          <select className="form-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Trạng thái:</label>
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success" disabled={saving}>
          {saving ? "Đang lưu..." : "Cập nhật bài viết"}
        </button>
      </form>
    </div>
  );
}

export default EditArticle;

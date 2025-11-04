const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

//  Cho phép frontend truy cập file ảnh đã upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//  MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "news_project",
});

db.connect((err) => {
  if (err) console.error(" Kết nối MySQL lỗi:", err);
  else console.log(" Kết nối MySQL thành công!");
});

//  Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

//  API Upload ảnh
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "Không có file ảnh!" });

  res.json({
    success: true,
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

//  LOGIN API
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM login WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.json({ success: false, message: "Lỗi server" });

    if (result.length > 0) {
      res.json({ success: true, email, role: result[0].role });
    } else {
      res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  });
});

// =================== ARTICLES ===================

//  Main articles
app.get("/articles/main", (req, res) => {
  db.query(
    `SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 5`,
    (err, rows) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, articles: rows });
    }
  );
});

//  Weekly highlight
app.get("/articles/weekly", (req, res) => {
  db.query(
    `SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 6`,
    (err, rows) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, articles: rows });
    }
  );
});

//  Latest news
app.get("/articles/latest", (req, res) => {
  db.query(
    `SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 9`,
    (err, rows) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, articles: rows });
    }
  );
});

//  SEARCH
app.get("/articles/search", (req, res) => {
  const keyword = req.query.q?.trim();
  if (!keyword) return res.json({ success: false });

  const sql = `SELECT * FROM articles WHERE LOWER(title) LIKE LOWER(CONCAT('%', ?, '%'))`;
  db.query(sql, [keyword], (err, rows) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, articles: rows });
  });
});

//  VIEW + COUNT VIEWS
app.get("/articles/:slug", (req, res) => {
  const { slug } = req.params;
  const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!global.viewCache) global.viewCache = new Map();
  const cacheKey = `${userIp}-${slug}`;
  const now = Date.now();

  if (!global.viewCache.get(cacheKey) || now - global.viewCache.get(cacheKey) > 5 * 60 * 1000) {
    db.query(`UPDATE articles SET views = views + 1 WHERE slug = ?`, [slug]);
    global.viewCache.set(cacheKey, now);
  }

  db.query(
    `SELECT * FROM articles WHERE slug=? AND status='published' LIMIT 1`,
    [slug],
    (err, rows) => {
      if (err || rows.length === 0)
        return res.json({ success: false, message: "Không tồn tại!" });

      res.json({ success: true, article: rows[0] });
    }
  );
});

//  Categories
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id ASC", (err, rows) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, categories: rows });
  });
});

//  Articles by category
app.get("/category/:slug", (req, res) => {
  const { slug } = req.params;
  db.query("SELECT * FROM categories WHERE slug=?", [slug], (err, categories) => {
    if (categories.length === 0)
      return res.json({ success: false, message: "Không tìm thấy danh mục" });

    const categoryId = categories[0].id;
    db.query(
      "SELECT * FROM articles WHERE category_id=? ORDER BY published_at DESC",
      [categoryId],
      (err, rows) => {
        res.json({ success: true, category: categories[0], articles: rows });
      }
    );
  });
});

//  Add article
app.post("/articles", (req, res) => {
  let { title, slug, excerpt, content, image, category_id, status } = req.body;

  if (!title || !content)
    return res.json({ success: false, message: "Thiếu dữ liệu!" });

  if (!slug)
    slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  const sql = `
  INSERT INTO articles(title, slug, excerpt, content, image, category_id, status, published_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      slug,
      excerpt || null,
      content,
      image || null,
      category_id || null,
      status || "draft",
      new Date(),
    ],
    (err) => {
      if (err) {
        console.log("Lỗi SQL:", err.sqlMessage);
        return res.json({ success: false });
      }
      res.json({ success: true, message: "Thêm bài viết thành công!" });
    }
  );
});

// ✅ Lấy danh sách bài viết cho Admin + phân trang
// ✅ Admin manage article list + search + filter
app.get("/admin/articles", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const offset = (page - 1) * limit;

  const search = req.query.search || "";
  const category = req.query.category || "";

  let where = "WHERE 1=1";

  if (search) where += ` AND title LIKE '%${search}%'`;
  if (category) where += ` AND category_id=${db.escape(category)}`;

  const sql = `
    SELECT a.*, c.name AS category_name 
    FROM articles a
    LEFT JOIN categories c ON a.category_id=c.id
    ${where}
    ORDER BY a.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.json({ success: false });

    db.query(`SELECT COUNT(*) AS total FROM articles ${where}`, (err2, count) => {
      const totalPages = Math.ceil(count[0].total / limit);
      res.json({ success: true, articles: rows, totalPages });
    });
  });
});


// ✅ DELETE Article
app.delete("/articles/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM articles WHERE id=?", [id], (err, result) => {
    if (err) return res.json({ success: false, message: "Lỗi SQL!" });
    res.json({ success: true, message: "Xóa bài viết thành công!" });
  });
});

// ✅ UPDATE Article
app.put("/articles/:id", (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, image, category_id, status } = req.body;

  const sql = `
    UPDATE articles SET title=?, slug=?, excerpt=?, content=?, image=?, 
    category_id=?, status=? WHERE id=?
  `;

  db.query(
    sql,
    [title, slug, excerpt, content, image, category_id, status, id],
    (err) => {
      if (err) return res.json({ success: false, message: "Lỗi SQL!" });
      res.json({ success: true, message: "Cập nhật thành công!" });
    }
  );
});

// Get article by ID
app.get("/articles/id/:id", (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM articles WHERE id=? LIMIT 1",
    [id],
    (err, rows) => {
      if (err || rows.length === 0)
        return res.json({ success: false, message: "Không tồn tại!" });

      res.json({ success: true, article: rows[0] });
    }
  );
});

// Update article
app.put("/articles/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;

  db.query(
    "UPDATE articles SET ? WHERE id=?",
    [data, id],
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    }
  );
});


//  START SERVER
app.listen(8081, () => console.log(" Server chạy tại http://localhost:8081"));

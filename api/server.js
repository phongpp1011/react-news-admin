const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Public folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL connect
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "news_project",
});

db.connect((err) => {
  if (err) console.error("Lỗi MySQL:", err);
  else console.log("MySQL connected!");
});

/* =================================================
   UPLOAD IMAGE
=================================================*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "")),
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "No image!" });

  res.json({
    success: true,
    fileName: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

/* =================================================
   LOGIN
=================================================*/
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM login WHERE email=? AND password=?",
    [email, password],
    (err, results) => {
      if (err) return res.json({ success: false, message: "Lỗi server" });

      if (results.length)
        return res.json({
          success: true,
          email,
          role: results[0].role,
        });

      res.json({ success: false, message: "Sai tài khoản hoặc mật khẩu" });
    }
  );
});

/* =================================================
   PUBLIC ARTICLES API
=================================================*/
app.get("/articles/main", (req, res) => {
  db.query(
    "SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 5",
    (err, rows) => res.json({ success: !err, articles: rows })
  );
});

app.get("/articles/weekly", (req, res) => {
  db.query(
    `SELECT *
     FROM articles
     WHERE status='published'
       AND published_at >= NOW() - INTERVAL 7 DAY
     ORDER BY views DESC, published_at DESC
     LIMIT 6`,
    (err, rows) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, articles: rows });
    }
  );
});


app.get("/articles/latest", (req, res) => {
  db.query(
    "SELECT * FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 9",
    (err, rows) => res.json({ success: !err, articles: rows })
  );
});

// Search
app.get("/articles/search", (req, res) => {
  const q = req.query.q?.trim();
  if (!q) return res.json({ success: false });

  db.query(
    "SELECT * FROM articles WHERE LOWER(title) LIKE LOWER(?)",
    ["%" + q + "%"],
    (err, rows) => res.json({ success: !err, articles: rows })
  );
});

/* =================================================
   VIEW ARTICLE (KHÔNG tăng view nữa)
=================================================*/
app.get("/articles/:slug", (req, res) => {
  const { slug } = req.params;

  db.query(
    "SELECT * FROM articles WHERE slug=? AND status='published' LIMIT 1",
    [slug],
    (err, rows) => {
      if (err || !rows.length)
        return res.json({ success: false, message: "Không tồn tại!" });

      res.json({ success: true, article: rows[0] });
    }
  );
});

/* =================================================
   API TĂNG VIEW RIÊNG
=================================================*/
app.post("/articles/increase-view", (req, res) => {
  const { slug } = req.body;

  if (!slug) return res.json({ success: false });

  db.query(
    "UPDATE articles SET views = views + 1 WHERE slug=?",
    [slug],
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    }
  );
});

/* =================================================
   CATEGORIES
=================================================*/
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id ASC", (err, rows) =>
    res.json({ success: !err, categories: rows })
  );
});

/* =================================================
   ADD ARTICLE
=================================================*/
app.post("/articles", (req, res) => {
  let { title, slug, excerpt, content, image, category_id, status, author_email } = req.body;
  if (!title || !content)
    return res.json({ success: false, message: "Thiếu dữ liệu!" });

  slug =
    slug ||
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  db.query(
    `INSERT INTO articles(title, slug, excerpt, content, image, category_id, status, author_email, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      excerpt || null,
      content,
      image || null,
      category_id || null,
      status || "draft",
      author_email || "Không rõ",
      new Date(),
    ],
    (err) => {
      if (err) return res.json({ success: false, message: "Lỗi khi thêm bài viết!" });
      res.json({ success: true, message: "Thêm bài viết thành công!" });
    }
  );
});

/* =================================================
   ADMIN: LIST ARTICLES + PAGINATION
=================================================*/
app.get("/admin/articles", (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 6;
  const offset = (page - 1) * limit;

  db.query(
    `SELECT a.*, c.name AS category_name 
     FROM articles a
     LEFT JOIN categories c ON a.category_id=c.id
     ORDER BY a.published_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => {
      if (err) return res.json({ success: false });

      db.query("SELECT COUNT(*) AS total FROM articles", (err2, total) => {
        res.json({
          success: true,
          articles: rows,
          totalPages: Math.ceil(total[0].total / limit),
        });
      });
    }
  );
});

/* =================================================
   ADMIN: GET ARTICLE BY ID
=================================================*/
app.get("/admin/articles/:id", (req, res) => {
  db.query(
    "SELECT * FROM articles WHERE id=? LIMIT 1",
    [req.params.id],
    (err, rows) => {
      if (err || !rows.length)
        return res.json({ success: false, message: "Không tồn tại!" });

      res.json({ success: true, article: rows[0] });
    }
  );
});

/* =================================================
   UPDATE ARTICLE
=================================================*/
app.put("/admin/articles/:id", (req, res) => {
  const { id } = req.params;
  const { title, slug, excerpt, content, image, category_id, status, author_email } = req.body;

  db.query(
    `UPDATE articles SET title=?, slug=?, excerpt=?, content=?, image=?, category_id=?, status=?, author_email=? WHERE id=?`,
    [title, slug, excerpt, content, image, category_id, status, author_email, id],
    (err) => {
      if (err) return res.json({ success: false, message: "Lỗi khi cập nhật bài viết!" });
      res.json({ success: true, message: "Cập nhật thành công!" });
    }
  );
});

/* =================================================
   DELETE ARTICLE + XÓA FILE ẢNH
=================================================*/
app.delete("/articles/:id", (req, res) => {
  db.query("SELECT image FROM articles WHERE id=?", [req.params.id], (err, rows) => {
    if (err) return res.json({ success: false });
    const imagePath = rows[0]?.image ? path.join(__dirname, rows[0].image) : null;

    db.query("DELETE FROM articles WHERE id=?", [req.params.id], (err) => {
      if (err) return res.json({ success: false });

      if (imagePath) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error("Lỗi xóa file ảnh:", err);
        });
      }

      res.json({ success: true, message: "Xóa bài viết và ảnh thành công!" });
    });
  });
});

/* =================================================
   ADMIN COMMENTS (PHÂN TRANG + TÌM KIẾM)
=================================================*/
app.get("/admin/comments", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const q = req.query.q || "";
  const limit = 10;
  const offset = (page - 1) * limit;

  let where = "";
  let params = [];

  if (q) {
    where = "WHERE user_email LIKE ? OR content LIKE ?";
    params.push(`%${q}%`, `%${q}%`);
  }

  // Đếm tổng
  db.query(`SELECT COUNT(*) as total FROM comments ${where}`, params, (err, countResult) => {
    if (err) return res.json({ success: false });

    const totalPages = Math.ceil(countResult[0].total / limit);

    // Lấy dữ liệu comment
    db.query(
      `SELECT comments.*, articles.title as article_title
       FROM comments
       LEFT JOIN articles ON comments.article_id = articles.id
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
      (err2, rows) => {
        if (err2) return res.json({ success: false });
        res.json({ success: true, comments: rows, totalPages });
      }
    );
  });
});


/* =================================================
   RSS AGGREGATOR
=================================================*/
const Parser = require("rss-parser");
const parser = new Parser();
const cheerio = require("cheerio");

const RSS_SOURCES = [
  { name: "VNExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
  { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
  { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
];

function getRSSImage(item, defaultImage = "/default.jpg") {
  if (item.enclosure?.url) return item.enclosure.url;

  const html = item.content || item.description || "";
  if (html) {
    const $ = cheerio.load(html);
    const img = $("img").first();
    if (img.attr("src")) return img.attr("src");
  }

  return defaultImage;
}

app.get("/aggregate/rss", async (req, res) => {
  try {
    let allArticles = [];

    for (const source of RSS_SOURCES) {
      try {
        const feed = await parser.parseURL(source.url);

        const items = feed.items.slice(0, 10).map((item) => ({
          title: item.title,
          slug: (item.link || "")
            .split("/")
            .pop()
            .replace(".html", "")
            .replace(/[^a-zA-Z0-9-]/g, ""),
          excerpt: item.contentSnippet || "",
          content: item.content || item.description || "",
          image: getRSSImage(item),
          author_email: source.name,
          category_id: 1,
          published_at: new Date(),
        }));

        allArticles.push(...items);
      } catch (e) {
        console.error(` Lỗi khi lấy nguồn ${source.name}:`, e.message);
      }
    }

    if (!allArticles.length) {
      return res.json({
        success: false,
        message: "Không lấy được bài nào từ các nguồn.",
      });
    }

    db.query(
      `INSERT IGNORE INTO articles
       (title, slug, excerpt, content, image, author_email, category_id, published_at, status)
       VALUES ?`,
      [
        allArticles.map((a) => [
          a.title,
          a.slug,
          a.excerpt,
          a.content,
          a.image,
          a.author_email,
          a.category_id,
          a.published_at,
          "published",
        ]),
      ],
      (err, result) => {
        if (err) return res.json({ success: false, message: "Lỗi SQL" });

        res.json({
          success: true,
          inserted: result.affectedRows,
          message: `Đã thêm ${result.affectedRows} bài mới từ RSS`,
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi tổng hợp tin tức!" });
  }
});

// GET danh mục theo slug + bài viết trong danh mục đó
app.get("/category/:slug", (req, res) => {
  const { slug } = req.params;

  // Lấy thông tin danh mục
  db.query("SELECT * FROM categories WHERE slug=? LIMIT 1", [slug], (err, catRows) => {
    if (err || !catRows.length) {
      return res.json({ success: false, message: "Danh mục không tồn tại" });
    }

    const category = catRows[0];

    // Lấy bài viết trong danh mục
    db.query(
      "SELECT * FROM articles WHERE category_id=? AND status='published' ORDER BY published_at DESC",
      [category.id],
      (err2, articleRows) => {
        if (err2) return res.json({ success: false, message: "Lỗi khi lấy bài viết" });

        res.json({ success: true, category, articles: articleRows });
      }
    );
  });
});


/* =================================================
   START SERVER
=================================================*/
app.listen(8081, () => console.log("Server chạy tại http://localhost:8081"));

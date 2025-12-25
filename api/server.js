const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// ==============================
//  SPAM KEYWORD DETECTION
// ==============================
function detectSpam(content) {
  const lower = content.toLowerCase();

  // Từ khóa spam phổ biến
  const spamKeywords = [
    "khuyến mãi",
    "giảm giá",
    "vay tiền",
    "lãi suất",
    "casino",
    "lô đề",
    "baccarat",
    "kiếm tiền",
    "tool",
    "hack",
    "tiktok follow",
    "xem ngay",
    "mua ngay",
    "sim số đẹp"
  ];

  // Check từ khóa
  for (let word of spamKeywords) {
    if (lower.includes(word)) return true;
  }

  // Link bất thường
  if (content.match(/https?:\/\/[^\s]+/gi)) return true;

  // Số điện thoại 10–11 số
  if (content.match(/\b\d{10,11}\b/)) return true;

  // Ký tự lặp
  if (/([!?.])\1{3,}/.test(content)) return true;

  // Ngắn hoặc dài quá mức
  if (content.length < 3 || content.length > 500) return true;

  return false;
}
let commentHistory = {}; // { ip: [timestamps] }


function checkFlood(ip) {
  const now = Date.now();

  if (!commentHistory[ip]) commentHistory[ip] = [];

  // Giữ lịch trong 10 phút
  commentHistory[ip] = commentHistory[ip].filter(
    (t) => now - t < 10 * 60 * 1000
  );

  commentHistory[ip].push(now);

  // > 10 comment / 10 phút => spam
  return commentHistory[ip].length > 10;
}

// Public folder for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL connect
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "news_project_new",
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
   VIEW ARTICLE (KHÔNG tăng view)
=================================================*/
app.get("/articles/:slug", (req, res) => {
  const { slug } = req.params;

  const sql = `
    SELECT 
      a.*,
      c.name AS category_name,
      c.slug AS category_slug
    FROM articles a
    JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ?
      AND a.status = 'published'
    LIMIT 1
  `;

  db.query(sql, [slug], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (!rows.length) {
      return res.json({
        success: false,
        message: "Không tồn tại!",
      });
    }

    res.json({
      success: true,
      article: rows[0],
    });
  });
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
   ADD ARTICLE (FIXED)
=================================================*/
/* =================================================
   ADD ARTICLE (FIXED) - force pending
=================================================*/
app.post("/articles", (req, res) => {
  let { title, slug, excerpt, content, image, category_id, status, author_email } = req.body;

  if (!title || !content)
    return res.json({ success: false, message: "Thiếu dữ liệu!" });

  // Auto slug
  slug =
    slug ||
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

  // Force inserted articles to be pending (chờ duyệt) regardless of client-provided status.
  const forcedStatus = "pending";
  const publishedAt = null; // sẽ được set khi admin duyệt

  db.query(
    `INSERT INTO articles(title, slug, excerpt, content, image, category_id, status, author_email, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      slug,
      excerpt || null,
      content,
      image || null,
      Number(category_id) || null,
      forcedStatus,
      author_email || null,
      publishedAt,
    ],
    (err) => {
      if (err) {
        console.error("SQL Error:", err);
        return res.json({ success: false, message: "Lỗi khi thêm bài viết!", error: err });
      }
      res.json({ success: true, message: "Thêm bài viết thành công! Bài sẽ chờ admin duyệt." });
    }
  );
});



/* =================================================
   ADMIN: LIST ARTICLES + PAGINATION
=================================================*/
app.get("/admin/articles", (req, res) => {
  const status = req.query.status || null;

  let sql = `
    SELECT a.*, c.name AS category_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id=c.id
  `;

  let params = [];

  if (status) {
    sql += " WHERE a.status=? ";
    params.push(status);
  }

  sql += " ORDER BY a.id DESC";

  db.query(sql, params, (err, rows) => {
    if (err) return res.json({ success: false });

    res.json({
      success: true,
      articles: rows,
    });
  });
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
   APPROVE ARTICLE (ADMIN)
   PUT /admin/articles/approve/:id
   => chuyển pending -> published và set published_at = NOW()
=================================================*/
app.put("/admin/articles/approve/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE articles SET status = 'published', published_at = ? WHERE id = ?",
    [new Date(), id],
    (err, result) => {
      if (err) {
        console.error("Lỗi khi duyệt bài:", err);
        return res.json({ success: false, message: "Lỗi khi duyệt bài" });
      }
      if (result.affectedRows === 0) {
        return res.json({ success: false, message: "Bài viết không tồn tại" });
      }
      res.json({ success: true, message: "Duyệt và xuất bản bài viết thành công" });
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



// Lấy bình luận của 1 bài viết (chỉ approved)
app.get("/comments/:article_id", (req, res) => {
  const { article_id } = req.params;

  db.query(
    "SELECT * FROM comments WHERE article_id=? AND status='approved' ORDER BY created_at DESC",
    [article_id],
    (err, rows) => {
      if (err) {
        console.error("Lỗi khi lấy bình luận:", err);
        return res.json({ success: false, comments: [] });
      }

      res.json({
        success: true,
        comments: rows,
      });
    }
  );
});

/* =================================================
   USER: ADD COMMENT + AUTO SPAM DETECT
=================================================*/
app.post("/comments", (req, res) => {
  const { article_id, user_email, content } = req.body;
  const ip = req.ip;

  // 1. Spam theo nội dung
  const isSpam = detectSpam(content);

  // 2. Spam theo tần suất
  const floodSpam = checkFlood(ip);

  const finalStatus = isSpam || floodSpam ? "spam" : "approved";

  const sql =
    "INSERT INTO comments (article_id, user_email, content, status) VALUES (?, ?, ?, ?)";

  db.query(sql, [article_id, user_email, content, finalStatus], (err) => {
    if (err)
      return res.json({ success: false, message: "Lỗi khi thêm bình luận" });

    return res.json({
      success: true,
      status: finalStatus,
      message:
        finalStatus === "spam"
          ? "Bình luận bị đánh dấu là SPAM."
          : "Đã gửi bình luận!",
    });
  });
});

/* =================================================
   ADMIN COMMENTS (LIST + SEARCH + PAGINATION)
=================================================*/
app.get("/admin/comments", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const q = req.query.q || "";
  const search = `%${q}%`;

  const sql = `
    SELECT comments.*, articles.title AS article_title
    FROM comments
    LEFT JOIN articles ON comments.article_id = articles.id
    WHERE comments.user_email LIKE ?
       OR comments.content LIKE ?
       OR comments.status LIKE ?
    ORDER BY comments.created_at DESC
    LIMIT ?, ?
  `;

  db.query(sql, [search, search, search, offset, limit], (err, rows) => {
    if (err) return res.json({ success: false });

    const countSQL = `
      SELECT COUNT(*) AS count
      FROM comments
      WHERE user_email LIKE ?
         OR content LIKE ?
         OR status LIKE ?
    `;

    db.query(countSQL, [search, search, search], (cErr, cRows) => {
      if (cErr) return res.json({ success: false });

      const total = cRows[0].count;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        comments: rows,
        totalPages,
      });
    });
  });
});
/* =================================================
   UPDATE COMMENT STATUS
=================================================*/
app.put("/admin/comments/status/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!["pending", "approved", "spam"].includes(status)) {
    return res.json({ success: false, message: "Trạng thái không hợp lệ" });
  }

  db.query(
    "UPDATE comments SET status = ? WHERE id = ?",
    [status, id],
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true, message: "Đã cập nhật trạng thái" });
    }
  );
});
/* =================================================
   DELETE COMMENT
=================================================*/
app.delete("/comments/:id", (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.json({ success: false, message: "Thiếu ID bình luận" });
  }

  const sql = "DELETE FROM comments WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa bình luận:", err);
      return res.json({ success: false, message: "Lỗi server" });
    }

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Bình luận không tồn tại" });
    }

    return res.json({ success: true, message: "Đã xóa bình luận" });
  });
});

app.post("/comments/like", (req, res) => {
  const { id } = req.body;
  db.query(
    "UPDATE comments SET likes = likes + 1 WHERE id = ?",
    [id],
    () => res.json({ success: true })
  );
});
app.post("/comments/dislike", (req, res) => {
  const { id } = req.body;
  db.query(
    "UPDATE comments SET dislikes = dislikes + 1 WHERE id = ?",
    [id],
    () => res.json({ success: true })
  );
});
app.post("/comments/reply", (req, res) => {
  const { article_id, parent_id, user_email, content } = req.body;

  db.query(
    "INSERT INTO comments (article_id, parent_id, user_email, content) VALUES (?, ?, ?, ?)",
    [article_id, parent_id, user_email, content],
    () => res.json({ success: true })
  );
});
app.get("/comments/:id", (req, res) => {
  const articleId = req.params.id;
  const sort = req.query.sort === "new" ? "ORDER BY created_at DESC" : "";

  db.query(
    `SELECT * FROM comments WHERE article_id=? ${sort}`,
    [articleId],
    (err, data) => {
      if (err) return res.json({ success: false });

      const root = data.filter((c) => c.parent_id === null);
      const replies = data.filter((c) => c.parent_id !== null);

      root.forEach((c) => {
        c.replies = replies.filter((r) => r.parent_id === c.id);
      });

      res.json({ success: true, comments: root });
    }
  );
});





/* =================================================
   RSS AGGREGATOR – dành cho news_project_new
=================================================*/
const Parser = require("rss-parser");
const parser = new Parser();
const cheerio = require("cheerio");
const crypto = require("crypto");

// Nguồn RSS
const RSS_SOURCES = [
  { name: "VNExpress", url: "https://vnexpress.net/rss/tin-moi-nhat.rss" },
  { name: "Tuổi Trẻ", url: "https://tuoitre.vn/rss/tin-moi-nhat.rss" },
  { name: "Thanh Niên", url: "https://thanhnien.vn/rss/home.rss" },
];

// Hàm lấy hình
function getRSSImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;

  const html = item.content || item.description || "";
  const $ = cheerio.load(html);
  const img = $("img").first().attr("src");

  return img ? img : "/default.jpg";
}

// Tạo slug gốc
function createBaseSlug(text) {
  return text
    ?.toLowerCase()
    ?.normalize("NFD")
    ?.replace(/[\u0300-\u036f]/g, "")
    ?.replace(/[^a-z0-9]+/g, "-")
    ?.replace(/^-+|-+$/g, "") || "tin-tuc";
}

// Tạo slug duy nhất
function createUniqueSlug(title) {
  const base = createBaseSlug(title);
  const rand = crypto.randomBytes(5).toString("hex");
  return `${base}-${rand}`;
}

app.get("/aggregate/rss", async (req, res) => {
  console.log("Bắt đầu tổng hợp RSS");

  try {
    let allArticles = [];

    for (const source of RSS_SOURCES) {
      try {
        const feed = await parser.parseURL(source.url);

        feed.items.slice(0, 10).forEach((item) => {
          const slug = createUniqueSlug(item.title || "tin-tuc");

          allArticles.push({
            title: item.title,
            slug: slug,
            excerpt: item.contentSnippet || "",
            content: item.content || item.description || "",
            image: getRSSImage(item),
            author_email: "Khách",
            category_id: 1,
            published_at: new Date(),
            status: "pending",
            views: 0,
          });
        });
      } catch (err) {
        console.error(`Lỗi khi lấy RSS từ ${source.name}`);
      }
    }

    if (allArticles.length === 0) {
      return res.json({ success: false, message: "Không lấy được bài nào từ RSS" });
    }

    db.query(
      `INSERT INTO articles
        (title, slug, excerpt, content, image, published_at, views, status, category_id, author_email)
        VALUES ?`,
      [
        allArticles.map((a) => [
          a.title,
          a.slug,
          a.excerpt,
          a.content,
          a.image,
          a.published_at,
          a.views,
          a.status,
          a.category_id,
          a.author_email,
        ]),
      ],
      (err, result) => {
        if (err) {
          console.error("Lỗi SQL khi chèn dữ liệu RSS");
          return res.json({ success: false, message: "Lỗi SQL khi chèn dữ liệu RSS" });
        }

        console.log(`Đã thêm ${result.affectedRows} bài mới`);
        return res.json({
          success: true,
          count: result.affectedRows,
          message: `Đã thêm ${result.affectedRows} bài mới`,
        });
      }
    );
  } catch (err) {
    console.error("Lỗi tổng hợp RSS", err);
    return res.json({ success: false, message: "Lỗi tổng hợp RSS" });
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

app.get("/users", (req, res) => {
    const sql = `
        SELECT users.id, users.fullname, users.phone, users.avatar, 
               users.address, users.created_at, users.status, 
               login.email, login.role
        FROM users
        INNER JOIN login ON users.email = login.email
    `;

    db.query(sql, (err, data) => {
        if (err) {
            return res.json({ error: err });
        }
        return res.json(data);
    });
});
// GET: danh sách danh mục
app.get("/admin/categories", (req, res) => {
  const sql = `
    SELECT id, name, slug, description, created_at, updated_at
    FROM categories
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json(results);
  });
});
// POST: thêm danh mục
app.post("/admin/categories", (req, res) => {
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu name hoặc slug" });
  }

  const sql = `
    INSERT INTO categories (name, slug, description)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [name, slug, description || null], (err, result) => {
    if (err) {
      // lỗi trùng slug (UNIQUE)
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Slug đã tồn tại" });
      }
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, id: result.insertId });
  });
});
// PUT: cập nhật danh mục
app.put("/admin/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  const sql = `
    UPDATE categories
    SET name = ?, slug = ?, description = ?
    WHERE id = ?
  `;

  db.query(sql, [name, slug, description || null, id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ success: false, message: "Slug đã tồn tại" });
      }
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});
// DELETE: xóa danh mục
app.delete("/admin/categories/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM categories WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});


/* =================================================
   START SERVER
=================================================*/
app.listen(8081, () => console.log("Server chạy tại http://localhost:8081"));

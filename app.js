// 카페 메뉴 CRUD 서버
const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function integer(value) {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

// 조회 (Read): 전체 목록 + 메뉴 이름 검색
app.get("/", async (req, res) => {
  const keyword = text(req.query.keyword);
  const [menus] = await db.execute(
    "SELECT id, menu, category, price FROM cafe_menu WHERE menu LIKE ? ORDER BY id",
    [`%${keyword}%`]
  );
  res.render("index", { menus, keyword });
});

// 추가 (Create)
app.post("/menus", async (req, res) => {
  const menu = text(req.body.menu);
  const category = text(req.body.category);
  const price = integer(req.body.price);
  if (!menu || [...menu].length > 100 || !category || [...category].length > 20 || price === null || price < -2147483648 || price > 2147483647) {
    return res.status(400).render("error", { message: "입력값을 확인하세요." });
  }
  await db.execute("INSERT INTO cafe_menu (menu, category, price) VALUES (?, ?, ?)", [menu, category, price]);
  res.redirect(303, "/");
});

// 수정 (Update)
app.post("/menus/update", async (req, res) => {
  const id = integer(req.body.id);
  const menu = text(req.body.menu);
  const category = text(req.body.category);
  const price = integer(req.body.price);
  if (id === null || id <= 0 || !menu || [...menu].length > 100 || !category || [...category].length > 20 || price === null || price < -2147483648 || price > 2147483647) {
    return res.status(400).render("error", { message: "입력값을 확인하세요." });
  }
  const [result] = await db.execute("UPDATE cafe_menu SET menu = ?, category = ?, price = ? WHERE id = ?", [menu, category, price, id]);
  if (result.affectedRows === 0) return res.status(404).render("error", { message: "해당 번호의 메뉴가 없습니다." });
  res.redirect(303, "/");
});

// 삭제 (Delete)
app.post("/menus/delete", async (req, res) => {
  const id = integer(req.body.id);
  if (id === null || id <= 0) {
    return res.status(400).render("error", { message: "삭제할 번호를 확인하세요." });
  }
  const [result] = await db.execute("DELETE FROM cafe_menu WHERE id = ?", [id]);
  if (result.affectedRows === 0) return res.status(404).render("error", { message: "해당 번호의 메뉴가 없습니다." });
  res.redirect(303, "/");
});

// 오류 처리 (항상 맨 아래에 둔다)
app.use((err, req, res, next) => {
  console.error(err.code || err.message);
  res.status(500).render("error", {
    message: "요청 처리에 실패했습니다. MySQL 연결과 cafe_menu 테이블을 확인하세요.",
  });
});

app.listen(3000, () => {
  console.log("서버 실행: http://localhost:3000");
});

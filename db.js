// mysql2 연결 설정 (cafe 메뉴 CRUD)

const mysql = require("mysql2/promise");

// 커넥션 풀: 연결을 미리 만들어 두고 재사용한다
const pool = mysql.createPool({
  host: "localhost",
  user: "cafedb0825",
  password: "cafedb0825",
  database: "cafedb",
  connectionLimit: 5,
});

module.exports = pool;

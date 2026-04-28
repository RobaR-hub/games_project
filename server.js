const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new Database("game.db");

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    score INTEGER
  )
`,
).run();

app.post("/save", (req, res) => {
  const { name, score } = req.body;

  const row = db.prepare("SELECT * FROM scores WHERE name = ?").get(name);

  if (!row) {
    db.prepare("INSERT INTO scores (name, score) VALUES (?, ?)").run(
      name,
      score,
    );
    return res.send("New player");
  }

  if (score > row.score) {
    db.prepare("UPDATE scores SET score = ? WHERE name = ?").run(score, name);
    return res.send("Updated");
  }

  res.send("Not improved");
});

app.get("/scores", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM scores ORDER BY score DESC LIMIT 10")
    .all();

  res.json(rows);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("game.db");

db.run(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    score INTEGER
  )
`);

app.post("/save", (req, res) => {
  const { name, score } = req.body;

  db.get("SELECT * FROM scores WHERE name = ?", [name], (err, row) => {
    if (err) return res.status(500).send(err);

    if (!row) {
      // если такого имени нет → создаём
      db.run(
        "INSERT INTO scores (name, score) VALUES (?, ?)",
        [name, score],
        (err) => {
          if (err) return res.status(500).send(err);
          res.send("New player saved");
        },
      );
    } else {
      // если есть → проверяем счёт
      if (score > row.score) {
        db.run(
          "UPDATE scores SET score = ? WHERE name = ?",
          [score, name],
          (err) => {
            if (err) return res.status(500).send(err);
            res.send("Score updated");
          },
        );
      } else {
        res.send("Score not improved");
      }
    }
  });
});

app.get("/scores", (req, res) => {
  db.all(
    "SELECT * FROM scores ORDER BY score DESC LIMIT 10",
    [],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    },
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running");
});

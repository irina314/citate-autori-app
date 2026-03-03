const express = require("express");
const cors = require("cors");
const fs = require("fs"); // modul pentru operații cu fișiere
const path = require("path"); // modul pentru construirea căilor

const app = express(); // creează instanța aplicației Express
app.use(cors()); // activează CORS - orice client poate face cereri
app.use(express.json()); // middleware care parsează automat corpul cererilor HTTP cu Content-Type: application/json

// Rută statică catre imagini
app.use("/images", express.static(path.join(__dirname, "images")));

// Ruta de test
app.get("/", (req, res) => {
  res.json({
    message: "Citate Autori API functioneaza...",
    endpoints: {
      quotes: "/api/quotes",
      health: "/api/health",
    },
  });
});

let quotes = [
{ id: 1, author: "Socrates", quote: "The only true wisdom is in knowing you know nothing." },
{ id: 2, author: "Albert Einstein", quote: "Life is like riding a bicycle. To keep your balance you must keep moving." }
];

// GET /api/quotes - Returnează lista completă a citatelor
app.get("/api/quotes", (req, res) => {
res.status(200).json(quotes);
});

// POST /api/quotes - Adaugă un citat nou trimis în corpul cererii
app.post("/api/quotes", (req, res) => {
const { author, quote } = req.body;
const newQuote = {
id: quotes.length + 1, // Generăm un ID unic
author,
quote
};
quotes.push(newQuote);
res.status(201).json(newQuote);
});

// PUT /api/quotes/:id - Actualizează citatul cu ID-ul specificat în URL
app.put("/api/quotes/:id", (req, res) => {
const id = parseInt(req.params.id);
const { author, quote } = req.body;

const index = quotes.findIndex(q => q.id === id);

if (index === -1) {
return res.status(404).json({ message: "Citatul nu a fost găsit." });
}

quotes[index] = { id, author, quote };
res.status(200).json(quotes[index]);
});

// DELETE /api/quotes/:id - Șterge citatul cu ID-ul specificat din array
app.delete("/api/quotes/:id", (req, res) => {
const id = parseInt(req.params.id);
const index = quotes.findIndex(q => q.id === id);

if (index === -1) {
return res.status(404).json({ message: "Citatul nu a fost găsit." });
}

quotes.splice(index, 1);
res.status(200).json({ message: "Citatul a fost șters cu succes." });
});

// Pornim serverul pe portul 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul ruleaza la http://localhost:${PORT}`);
  console.log(
    `Ruta statica catre imagini din: ${path.join(__dirname, "images")}`,
  );
});

// Verificam repornirea automata a serverului
console.log("Server restarted!");

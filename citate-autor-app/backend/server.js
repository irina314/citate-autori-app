require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const OpenAI = require("openai");

const app = express();
const port = 5000;
const JSON_SERVER_URL = "http://localhost:3000/quotes"; // Asigură-te că aceasta este definită!

// Inițializăm clientul OpenAI
const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE ȘI VALIDARE (Necesar pentru rutele de mai jos) ---
const validateId = (req, res, next) => {
    if (isNaN(req.params.id) && typeof req.params.id !== 'string') {
        return res.status(400).json({ error: "ID invalid" });
    }
    next();
};

const quoteSchema = Joi.object({
    author: Joi.string().min(3).required(),
    quote: Joi.string().min(10).required(),
    imageUrl: Joi.string().allow("")
});

// --- RUTE AI (PASUL 8 și 9) ---

// Pasul 8.4: Generare citat [cite: 53]
app.post("/api/quotes/generate-quote", async (req, res) => {
    const { author } = req.body;
    if (!author || !author.trim()) {
        return res.status(400).json({ error: "Numele autorului este obligatoriu." });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Ești un cunoscator în literatură și filosofie. Generezi citate scurte, inspiraționale și autentice. Răspunzi DOAR cu citatul, fără ghilimele, fără numele autorului, fără explicații suplimentare. Maxim 2 propoziții." },
                { role: "user", content: `Scrie un citat autentic specific lui ${author.trim()}. Dacă autorul are citate celebre cunoscute, folosește unul dintre ele. Dacă nu, generează unul în stilul și filosofia sa.` }
            ],
            max_tokens: 150,
            temperature: 0.7,
        });
        const generatedQuote = completion.choices[0].message.content.trim();
        res.status(200).json({ quote: generatedQuote });
    } catch (error) {
        res.status(500).json({ error: "Nu s-a putut genera citatul." });
    }
});

// Pasul 9.1: Informații autor pentru Tooltip 
app.post("/api/quotes/author-info", async (req, res) => {
    const { author } = req.body;
    if (!author || !author.trim()) return res.status(400).json({ error: "Autor obligatoriu" });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eşti un asistent concis. Răspunzi doar în limba română. EXACT două propoziții scurte despre autor (domeniu, perioadă, contribuţie). Fără introduceri." },
                { role: "user", content: `Descrie pe ${author.trim()} în exact 2 propoziții.` }
            ],
            max_tokens: 120,
            temperature: 0.5,
        });
        const info = completion.choices[0].message.content.trim();
        res.status(200).json({ info });
    } catch (error) {
        res.status(500).json({ error: "Nu s-au putut prelua informațiile." });
    }
});

// --- RUTE CRUD (Definite DUPĂ rutele specifice AI) [cite: 51] ---

app.get("/api/quotes", async (req, res) => {
    try {
        const response = await fetch(JSON_SERVER_URL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quotes" });
    }
});

app.get("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const response = await fetch(`${JSON_SERVER_URL}/${req.params.id}`);
        if (!response.ok) return res.status(404).json({ error: "Quote not found" });
        const quote = await response.json();
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quote" });
    }
});

app.post("/api/quotes", async (req, res) => {
    const { error } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const response = await fetch(JSON_SERVER_URL);
        const quotes = await response.json();
        const newId = quotes.length > 0 ? Math.max(...quotes.map(q => Number(q.id))) + 1 : 1;
        const newQuote = { id: newId.toString(), ...req.body };

        const postResponse = await fetch(JSON_SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote),
        });
        const data = await postResponse.json();
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to add quote" });
    }
});

app.put("/api/quotes/:id", validateId, async (req, res) => {
    const { error } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const response = await fetch(`${JSON_SERVER_URL}/${req.params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: req.params.id, ...req.body }),
        });
        if (!response.ok) return res.status(404).json({ error: "Quote not found" });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to update quote" });
    }
});

app.delete("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const response = await fetch(`${JSON_SERVER_URL}/${req.params.id}`, { method: "DELETE" });
        if (!response.ok) return res.status(404).json({ error: "Quote not found" });
        res.status(200).json({ message: "Quote deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete quote" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log("Server restarted!");
});
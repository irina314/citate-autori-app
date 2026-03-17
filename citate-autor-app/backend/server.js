const express = require("express");
const cors = require("cors");
const Joi = require("joi"); // Importăm Joi pentru validare [cite: 161]
const app = express();

app.use(cors());
app.use(express.json());

const JSON_SERVER_URL = "http://localhost:3000/quotes";

// Middleware: verificăm dacă ID-ul este un număr valid 
const validateId = (req, res, next) => {
    if (isNaN(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID format" }); // 
    }
    next(); // Dacă e OK, mergem mai departe [cite: 173]
};

// Schema Joi pentru validarea citatelor [cite: 174]
const quoteSchema = Joi.object({
    id: Joi.string().optional(), // Permitem ID-ul pentru editare [cite: 308]
    author: Joi.string().min(2).required(),
    quote: Joi.string().min(5).required()
});
// API route placeholder [cite: 179]
app.get("/", (req, res) => {
    res.send("Printing Quotes API is running..."); // [cite: 182]
});

// Extragem citatele [cite: 183]
app.get("/api/quotes", async (req, res) => {
    try {
        const response = await fetch(JSON_SERVER_URL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch quotes" }); // [cite: 189]
    }
});

/// Ruta GET pentru a prelua un singur citat după ID [cite: 293]
app.get("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const quoteId = req.params.id; // [cite: 295]
        const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`); // [cite: 296]

        if (!response.ok) {
            return res.status(404).json({ error: "Quote not found" }); // [cite: 299]
        }

        const quote = await response.json(); // [cite: 296]
        res.json(quote); // [cite: 300]
    } catch (error) {
        console.error("Error fetching quote:", error); // 
        res.status(500).json({ error: "Failed to fetch quote" }); // [cite: 303]
    }
});

// Adăugăm un citat nou (cu VALIDARE) [cite: 192]
app.post("/api/quotes", async (req, res) => {
    const { error } = quoteSchema.validate(req.body); // Verificăm datele primite [cite: 194]
    if (error) {
        return res.status(400).json({ error: error.details[0].message }); // [cite: 197]
    }

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
        res.status(postResponse.status).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to add quote" });
    }
});

// Actualizăm un citat (cu validare ID și text) [cite: 220]
app.put("/api/quotes/:id", validateId, async (req, res) => {
    const { error } = quoteSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const quoteId = req.params.id;
        const updatedQuote = { id: quoteId, ...req.body };
        const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedQuote),
        });

        if (!response.ok) {
            return res.status(404).json({ error: "Quote not found" }); // [cite: 236]
        }
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to update quote" });
    }
});

// Ștergem un citat [cite: 247]
app.delete("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const quoteId = req.params.id;
        const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`, { method: "DELETE" });

        if (!response.ok) {
            return res.status(404).json({ error: "Quote not found" }); // [cite: 257]
        }
        res.status(200).json({ message: "Quote deleted successfully" }); // [cite: 258]
    } catch (error) {
        res.status(500).json({ error: "Failed to delete quote" });
    }
});
// Ruta DELETE pentru a șterge un citat după ID
app.delete("/api/quotes/:id", validateId, async (req, res) => {
    try {
        const quoteId = req.params.id;
        const response = await fetch(`${JSON_SERVER_URL}/${quoteId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            return res.status(404).json({ error: "Quote not found" });
        }

        res.json({ message: "Quote deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete quote" });
    }
});

const port = 5000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
console.log("Server restarted!");
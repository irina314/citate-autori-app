import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuoteCard from "../components/QuoteCard";
import { getAllQuotes, addQuote, updateQuote, deleteQuote, generateQuote } from "../api/quotesApi";

export default function ManagePage() {
    const [quotes, setQuotes] = useState([]);
    const [editingQuote, setEditingQuote] = useState(null);
    const [formData, setFormData] = useState({ author: "", quote: "" });
    const [feedback, setFeedback] = useState({ message: "", type: "" });
    const [loading, setLoading] = useState(true);

    // --- Stări noi pentru generarea AI (Pasul 8) ---
    const [aiLoading, setAiLoading] = useState(false);
    const [aiGenerated, setAiGenerated] = useState(false);

    useEffect(() => {
        fetchQuotes();
    }, []);

    // --- Debounce pe câmpul autor ---
    useEffect(() => {
        if (
            formData.author.trim().length < 3 || 
            editingQuote || 
            formData.quote.trim().length > 0
        ) return;

        const timer = setTimeout(async () => {
            setAiLoading(true);
            try {
                const result = await generateQuote(formData.author);
                setFormData(prev => ({ ...prev, quote: result.quote }));
                setAiGenerated(true);
            } catch (err) {
                console.warn("Generare AI eșuată:", err.message);
            } finally {
                setAiLoading(false);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [formData.author, editingQuote, formData.quote]);

    async function fetchQuotes() {
        try {
            const data = await getAllQuotes();
            setQuotes(data);
        } catch (err) {
            showFeedback(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === "quote") {
            setAiGenerated(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (editingQuote) {
                await updateQuote(editingQuote.id, formData);
                showFeedback("Citatul a fost actualizat.", "success");
            } else {
                await addQuote(formData);
                showFeedback("Citatul a fost adăugat.", "success");
            }
            resetForm();
            fetchQuotes();
        } catch (err) {
            showFeedback(err.message, "error");
        }
    }

    function handleEdit(quote) {
        setEditingQuote(quote);
        setFormData({ author: quote.author, quote: quote.quote });
        setAiGenerated(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleDelete(id) {
        if (!window.confirm("Ștergi acest citat?")) return;
        try {
            await deleteQuote(id);
            showFeedback("Citat șters.", "success");
            fetchQuotes();
        } catch (err) {
            showFeedback(err.message, "error");
        }
    }

    function resetForm() {
        setEditingQuote(null);
        setFormData({ author: "", quote: "" });
        setAiGenerated(false);
    }

    function showFeedback(message, type) {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
    }

    const inputClass = `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white text-gray-800 transition`;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-brand">Administrare citate</h1>
                    <Link to="/" className="text-brand hover:underline">← Înapoi</Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
                {feedback.message && (
                    <div className={`px-4 py-3 rounded-lg ${feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {feedback.message}
                    </div>
                )}

                <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className={`text-lg font-semibold mb-6 ${editingQuote ? "text-amber-600" : "text-brand"}`}>
                        {editingQuote ? "✎ Editează citatul" : "+ Adaugă citat nou"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                            <input
                                name="author"
                                type="text"
                                value={formData.author}
                                onChange={handleChange}
                                placeholder="ex. Albert Einstein"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* --- Secțiunea Citat (Actualizată conform Pasului 8.6) --- */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="quote" className="block text-sm font-medium text-gray-700">
                                    Citat
                                </label>

                                {aiLoading && (
                                    <span className="text-xs text-indigo-500 flex items-center gap-1 animate-pulse">
                                        <span>⚡</span> AI generează citatul...
                                    </span>
                                )}

                                {aiGenerated && !aiLoading && (
                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-200">
                                        ✨ Generat de AI
                                    </span>
                                )}
                            </div>

                            <textarea
                                id="quote"
                                name="quote"
                                value={formData.quote}
                                onChange={handleChange}
                                placeholder={aiLoading 
                                    ? "Se generează citatul..." 
                                    : "Introduceți citatul sau așteptați generarea automată..."}
                                rows={4}
                                className={`${inputClass} resize-none transition-all ${
                                    aiLoading ? "bg-indigo-50 border-indigo-200" : ""
                                }`}
                                required
                            />

                            <div className="flex justify-between mt-1 items-start">
                                <div className="flex flex-col gap-1">
                                    {aiGenerated && !aiLoading && (
                                        <p className="text-xs text-gray-400 italic">
                                            Δ Citat sugerat de AI – verificați autenticitatea înainte de salvare.
                                        </p>
                                    )}
                                </div>
                                <span className={`text-xs ml-auto flex-shrink-0 ${formData.quote.length > 450 ? "text-red-400" : "text-gray-400"}`}>
                                    {formData.quote.length}/500
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={aiLoading}
                                className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${
                                    aiLoading ? "bg-gray-400" : editingQuote ? "bg-amber-500 hover:bg-amber-600" : "bg-brand hover:bg-brand-dark"
                                }`}
                            >
                                {aiLoading ? "Se generează..." : editingQuote ? "Salvează" : "Adaugă"}
                            </button>
                            {editingQuote && (
                                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Anulează
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* --- Secțiunea de listare --- */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Citate existente ({quotes.length})
                    </h2>
                    {loading ? (
                        <p className="text-center py-10 animate-pulse text-brand">Se încarcă...</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quotes.map(q => (
                                <QuoteCard key={q.id} quote={q} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
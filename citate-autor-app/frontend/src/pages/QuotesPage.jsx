// useEffect - execută cod la montarea componentei (echivalent componentDidMount)
// useState - gestionează starea locală a componentei
import { useEffect, useState } from "react";

// Link - element de navigare React Router (similar cu <a> fără reload de pagină)
import { Link } from "react-router-dom";

import QuoteCard from "../components/QuoteCard";
import { getAllQuotes } from "../api/quotesApi";

export default function QuotesPage() {
    // `quotes`  - lista de citate primită de la backend
    // `loading` - true cât timp cererea fetch este în desfășurare
    // `error`   - mesajul de eroare dacă fetch eșuează
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect cu array gol [] = rulează o SINGURĂ DATĂ după primul render.
    // Realizează apeluri API la încărcarea paginii.
    useEffect(() => {
        getAllQuotes()
            .then(data => setQuotes(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false)); // se execută indiferent de succes/eroare
    }, []);

    // Stare UI pentru Încărcare
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-light">
                <p className="text-brand text-lg font-medium animate-pulse">
                    Se încarcă citatele...
                </p>
            </div>
        );
    }

    // Stare UI pentru Eroare (Rezolvă eroarea ESLint: 'error' is assigned a value but never used)
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 text-center max-w-sm">
                    <p className="text-red-600 font-bold mb-2">Eroare de conexiune</p>
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-brand text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Reîncearcă
                    </button>
                </div>
            </div>
        );
    }

    return (
        // min-h-screen = pagina ocupă cel puțin toată înălțimea ecranului
        // bg-brand-light = fundal ușor colorat din tema custom
        <div className="min-h-screen bg-brand-light">

            {/* --- Header --- */}
            {/* sticky top-0 z-10 = rămâne vizibil la scroll */}
            <header className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-brand">Citate Autori Celebri</h1>
                        <p className="text-sm text-gray-500">
                            {quotes.length} {quotes.length === 1 ? "citat" : "citate"}
                        </p>
                    </div>
                    {/* Link către ruta /manage - fără reload */}
                    <Link 
                        to="/manage"
                        className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-dark transition-colors duration-200"
                    >
                        ⚙ Administrează
                    </Link>
                </div>
            </header>

            {/* --- Grid de citate --- */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {quotes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-xl mb-4">Nu există citate încă.</p>
                        <Link to="/manage" className="text-brand underline hover:text-brand-dark">
                            Adaugă primul citat →
                        </Link>
                    </div>
                ) : (
                    // Grid responsiv: 1 coloană pe mobil, 2 pe tableta, 3 pe desktop
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quotes.map(q => (
                            // key={q.id} este obligatoriu în liste React
                            <QuoteCard key={q.id} quote={q} />
                            // fără onEdit/onDelete -> butoanele nu apar în QuotesPage
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
"use client";
import { useState } from 'react';

export default function Home() {
  const [hypothesis, setHypothesis] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Simulation de l'appel à ton algorithme VDG (à connecter plus tard)
    setTimeout(() => {
      setResult([
        { id: 1, text: "Divergence found in market microstructure", score: 0.94 },
        { id: 2, text: "High entropy detected in option pricing", score: 0.87 }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e]">
      <div className="max-w-2xl w-full space-y-8">
        
        {/* Logo / Titre */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            VARIENTROPY
          </h1>
          <p className="mt-4 text-gray-400">H(X) - I(X;Y) + Var(f)</p>
        </div>

        {/* Zone de saisie */}
        <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 shadow-2xl">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter your research query:
          </label>
          <textarea 
            className="w-full bg-[#000] text-white border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
            rows={3}
            placeholder="e.g. Analyze entropy in high-frequency trading data..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? "Calculating Divergence..." : "Run VDG Algorithm"}
          </button>
        </div>

        {/* Zone des résultats */}
        {result && (
          <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Divergence Results</h2>
            <ul className="space-y-3">
              {result.map((item: any) => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-lg">
                  <span className="text-gray-300">{item.text}</span>
                  <span className="font-mono text-blue-400 font-bold">{item.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}

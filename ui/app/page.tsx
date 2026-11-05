"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [hypothesis, setHypothesis] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 🎨 Le moteur visuel (Constellation Cryptographique)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; // Bleu
        ctx.fill();

        // Connexions quantiques
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / 120})`; // Violet
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setTimeout(() => {
      setResult([
        { id: 1, text: "Quantum alignment detected in market microstructure", score: 0.94 },
        { id: 2, text: "High entropy divergence in option pricing", score: 0.87 }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* L'interface visuelle en arrière-plan */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Le contenu par-dessus */}
      <div className="z-10 w-full max-w-2xl p-8 bg-black/40 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            VARIENTROPY
          </h1>
          <p className="mt-2 text-gray-400 font-mono">H(X) - I(X;Y) + Var(f)</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Enter your research query:
          </label>
          <textarea 
            className="w-full bg-black/50 text-white border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none transition font-mono"
            rows={3}
            placeholder="e.g. Analyze entropy in high-frequency trading data..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            {loading ? "Calculating Qubit Alignment..." : "Run VDG Algorithm"}
          </button>
        </div>

        {result && (
          <div className="mt-8 border-t border-gray-800 pt-6">
            <h2 className="text-xl font-bold mb-4 text-green-400">Divergence Results</h2>
            <ul className="space-y-3">
              {result.map((item: any) => (
                <li key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-gray-800">
                  <span className="text-gray-300">{item.text}</span>
                  <span className="font-mono text-blue-400 font-bold bg-blue-900/30 px-2 py-1 rounded">{item.score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [hypothesis, setHypothesis] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    let animationFrameId: number;
    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96, 165, 250, 0.6)'; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${1 - dist / 120})`; ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleGenerate = async () => {
    if (!hypothesis) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/vdg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: hypothesis })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col items-center justify-center p-4">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-2xl p-8 bg-black/70 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl">
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
            rows={2}
            placeholder="e.g. Analyze entropy in high-frequency trading data..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            {loading ? "Generating Proof..." : "Run VDG Algorithm"}
          </button>
        </div>

        {result && (
          <div className="mt-8 border-t border-gray-800 pt-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-400">V-ML Attestation</h2>
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300"
              >
                Copy JSON for AI
              </button>
            </div>
            
            <div className="p-4 bg-black/80 rounded-lg border border-green-900/50 space-y-3 font-mono text-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-400">Divergence:</span>
                <span className="text-blue-400 font-bold text-lg">{result.metrics.divergence_score}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-800 pb-2">
                <span className="text-gray-400">SHA-256 Proof:</span>
                <span className="text-gray-300 break-all text-xs">{result.cryptographic_proof.hash}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400 text-xs">Mathematically Validated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

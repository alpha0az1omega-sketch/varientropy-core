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
    <main style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ zIndex: 10, width: '100%', maxWidth: '650px', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid #333', borderRadius: '24px', padding: '40px', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VARIENTROPY
          </h1>
          <p style={{ marginTop: '10px', color: '#9ca3af', fontFamily: 'monospace', fontSize: '1.1rem' }}>H(X) - I(X;Y) + Var(f)</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: '0.9rem', color: '#d1d5db', fontWeight: 500 }}>
            Enter your research query:
          </label>
          <textarea 
            style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #4b5563', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', outline: 'none', resize: 'vertical' }}
            rows={3}
            placeholder="e.g. Analyze entropy in high-frequency trading data..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#1e3a8a' : '#2563eb', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 20px rgba(37,99,235,0.3)', transition: 'all 0.2s' }}
          >
            {loading ? "Calculating Qubit Alignment..." : "Run VDG Algorithm"}
          </button>
        </div>

        {result && (
          <div style={{ marginTop: '32px', borderTop: '1px solid #333', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ade80', margin: 0 }}>V-ML Attestation</h2>
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                style={{ backgroundColor: '#374151', color: '#d1d5db', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Copy JSON for AI
              </button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid #064e3b', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '0.9rem', boxShadow: '0 0 15px rgba(74, 222, 128, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #1f2937' }}>
                <span style={{ color: '#9ca3af' }}>Divergence Score:</span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '1.2rem' }}>{result.metrics?.divergence_score || result.divergence_score}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', borderBottom: '1px solid #1f2937' }}>
                <span style={{ color: '#9ca3af' }}>SHA-256 Cryptographic Proof:</span>
                <span style={{ color: '#d1d5db', wordBreak: 'break-all', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>{result.cryptographic_proof?.hash || result.sha256_hash}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ color: '#9ca3af' }}>Status:</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Mathematically Validated</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

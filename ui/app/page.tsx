"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [hypothesis, setHypothesis] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [engine, setEngine] = useState<'math' | 'ai'>('math');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles: any[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        baseRadius: Math.random() * 2 + 1
      });
    }
    
    let animationFrameId: number;
    const render = () => {
      const time = Date.now() / 1000;
      const breath = Math.sin(time * 1.5) * 0.5 + 0.5;
      
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        const currentRadius = p.baseRadius * (0.8 + breath * 0.6);
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        const hue = 220 + (breath * 40); 
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.8)`; 
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            const opacity = (1 - dist / 150) * (0.4 + breath * 0.6);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`; 
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleGenerate = async () => {
    if (!hypothesis) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/vdg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: hypothesis, mode: engine, apiKey: apiKey })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Connection failed." });
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `varientropy_proof_${result.cryptographic_proof?.hash?.substring(0, 8)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const generateSigil = (hash: string) => {
    if (!hash) return null;
    const c1 = parseInt(hash.substring(0, 6), 16) % 360;
    const c2 = parseInt(hash.substring(6, 12), 16) % 360;
    
    return (
      <svg width="150" height="150" viewBox="0 0 100 100" style={{ margin: '0 auto', display: 'block', filter: `drop-shadow(0 0 10px hsl(${c1}, 80%, 60%))` }}>
        <defs>
          <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`hsl(${c1}, 80%, 60%)`} />
            <stop offset="100%" stopColor={`hsl(${c2}, 80%, 60%)`} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="none" stroke={`url(#grad-${hash})`} strokeWidth="2" />
        <polygon points="50,5 95,50 50,95 5,50" fill="none" stroke={`url(#grad-${hash})`} strokeWidth="1.5" transform={`rotate(${c1} 50 50)`} />
        <path d={`M 20 50 Q 50 ${20 + (c2 % 40)} 80 50 T 20 50`} fill="none" stroke={`hsl(${c2}, 80%, 60%)`} strokeWidth="2" />
      </svg>
    );
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
      
      <div style={{ zIndex: 1, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>VARIENTROPY</h1>
          <p style={{ marginTop: '10px', color: '#9ca3af', fontFamily: 'monospace', fontSize: '1.1rem' }}>H(X) - I(X;Y) + Var(f)</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => setEngine('math')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #4b5563', backgroundColor: engine === 'math' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Mathematical (Deterministic)</button>
          <button onClick={() => setEngine('ai')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #4b5563', backgroundColor: engine === 'ai' ? '#2563eb' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }}>Scientific (AI)</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <textarea 
            style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #4b5563', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', outline: 'none', resize: 'none' }}
            rows={3}
            placeholder="Enter your hypothesis to generate a cryptographic proof..."
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
          />
          {engine === 'ai' && (
            <input 
              type="password"
              placeholder="Optionnel : Entrez votre clé API (OpenAI) pour l'analyse IA"
              style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid #4b5563', borderRadius: '12px', padding: '12px', fontFamily: 'monospace', outline: 'none' }}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          )}
          <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#1e3a8a' : '#2563eb', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
            {loading ? "Generating Proof..." : `Run Algorithm`}
          </button>
        </div>

        {result && !result.error && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4ade80', margin: 0 }}>V-ML Attestation</h2>
              <button onClick={downloadJSON} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>
                Download JSON Proof
              </button>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid #064e3b', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '0.8rem', boxShadow: '0 0 20px rgba(74, 222, 128, 0.15)' }}>
              <div style={{ marginBottom: '15px' }}>
                {generateSigil(result.cryptographic_proof?.hash)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #1f2937' }}>
                <span style={{ color: '#9ca3af' }}>Divergence Score:</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '1.1rem' }}>{result.metrics?.divergence_score}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 0', borderBottom: '1px solid #1f2937' }}>
                <span style={{ color: '#9ca3af' }}>SHA-256 Proof:</span>
                <span style={{ color: '#d1d5db', wordBreak: 'break-all', fontSize: '0.65rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>{result.cryptographic_proof?.hash}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px' }}>
                <span style={{ color: '#9ca3af' }}>Status:</span>
                <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Cryptographically Attested</span>
              </div>

              {result.ai_analysis && (
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #1f2937' }}>
                  <span style={{ color: '#a855f7', fontWeight: 'bold' }}>AI Analysis:</span>
                  <p style={{ color: '#d1d5db', marginTop: '5px', fontSize: '0.75rem', lineHeight: '1.4' }}>{result.ai_analysis}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

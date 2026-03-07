import { useRef, useEffect, useState, useCallback } from 'react';

interface Harmonic { freq: number; amp: number; phase: number; color: string }

const BASE_HARMONICS: Harmonic[] = [
  { freq: 1, amp: 1.0,  phase: 0, color: '#00d4ff' },
  { freq: 2, amp: 0.5,  phase: 0, color: '#8b5cf6' },
  { freq: 3, amp: 0.33, phase: 0, color: '#f472b6' },
  { freq: 4, amp: 0.25, phase: 0, color: '#22c55e' },
  { freq: 5, amp: 0.20, phase: 0, color: '#f59e0b' },
];

export default function FourierSynth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const [harmonics, setHarmonics] = useState<Harmonic[]>(BASE_HARMONICS);
  const [playing,   setPlaying]   = useState(true);
  const [showEach,  setShowEach]  = useState(true);
  const tRef      = useRef(0);
  const harmRef   = useRef(harmonics);
  const playRef   = useRef(playing);
  useEffect(() => { harmRef.current = harmonics; }, [harmonics]);
  useEffect(() => { playRef.current = playing; }, [playing]);

  const preset = useCallback((name: string) => {
    if (name === 'square')   setHarmonics(BASE_HARMONICS.map((h, i) => ({ ...h, amp: i % 2 === 0 ? 1 / (i + 1) : 0 })));
    if (name === 'sawtooth') setHarmonics(BASE_HARMONICS.map((h, i) => ({ ...h, amp: 1 / (i + 1) })));
    if (name === 'pure')     setHarmonics(BASE_HARMONICS.map((h, i) => ({ ...h, amp: i === 0 ? 1 : 0 })));
    if (name === 'chaos')    setHarmonics(BASE_HARMONICS.map(h => ({ ...h, amp: Math.random(), phase: Math.random() * Math.PI * 2 })));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d')!;
    let last = performance.now();

    function draw(ts: number) {
      const canvas = canvasRef.current; if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
      if (playRef.current) tRef.current += dt;
      const t = tRef.current;
      const W = canvas.width, H = canvas.height;
      const midY = H / 2;
      const hsArr = harmRef.current;
      const showE = showEach;

      ctx.clearRect(0, 0, W, H);

      // Center line
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();

      // Individual harmonics
      if (showE) {
        hsArr.forEach(h => {
          if (h.amp < 0.01) return;
          ctx.beginPath();
          for (let px = 0; px <= W; px++) {
            const x = px / W; // 0..1
            const y = midY - h.amp * (H * 0.18) * Math.sin(2 * Math.PI * h.freq * (x - t * 0.25) + h.phase);
            px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
          }
          ctx.strokeStyle = h.color + '55'; ctx.lineWidth = 1.5; ctx.stroke();
        });
      }

      // Composite wave
      ctx.beginPath();
      let maxAmp = hsArr.reduce((s, h) => s + h.amp, 0) || 1;
      for (let px = 0; px <= W; px++) {
        const x = px / W;
        const y = midY - (hsArr.reduce((sum, h) => sum + h.amp * Math.sin(2 * Math.PI * h.freq * (x - t * 0.25) + h.phase), 0) / maxAmp) * (H * 0.38);
        px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 10;
      ctx.stroke(); ctx.shadowBlur = 0;

      // Phasor circle (right side)
      const cx = W - 80, cy = H / 2, r = Math.min(H * 0.2, 60);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      let sumX = cx, sumY = cy;
      hsArr.forEach((h, i) => {
        if (h.amp < 0.01) return;
        const angle = 2 * Math.PI * h.freq * t * 0.25 + h.phase - Math.PI / 2;
        const nx = sumX + r * h.amp * Math.cos(angle) * (i === 0 ? 1 : 0.6);
        const ny = sumY + r * h.amp * Math.sin(angle) * (i === 0 ? 1 : 0.6);
        ctx.beginPath(); ctx.moveTo(sumX, sumY); ctx.lineTo(nx, ny);
        ctx.strokeStyle = h.color; ctx.lineWidth = 2; ctx.stroke();
        // dot
        ctx.beginPath(); ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fillStyle = h.color; ctx.fill();
        sumX = nx; sumY = ny;
      });
      // line from phasor tip to wave
      ctx.beginPath(); ctx.moveTo(sumX, sumY); ctx.lineTo(W - 160, sumY);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.setLineDash([]);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [showEach]);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors">
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => setShowEach(s => !s)}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors">
          {showEach ? 'Hide Harmonics' : 'Show Harmonics'}
        </button>
        {['pure', 'square', 'sawtooth', 'chaos'].map(p => (
          <button key={p} onClick={() => preset(p)}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors capitalize">
            {p}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} className="w-full rounded-xl" style={{ background: 'rgba(5,5,20,0.6)', height: 180 }} />
      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {harmonics.map((h, i) => (
          <div key={i} className="flex flex-col gap-1 p-2 rounded-xl border border-white/5" style={{ background: h.color + '11' }}>
            <span className="text-xs font-mono" style={{ color: h.color }}>f × {h.freq}</span>
            <label className="text-xs text-gray-500">Amp</label>
            <input type="range" min="0" max="1" step="0.01" value={h.amp}
              onChange={e => setHarmonics(hs => hs.map((x, j) => j === i ? { ...x, amp: parseFloat(e.target.value) } : x))}
              className="w-full" style={{ accentColor: h.color }} />
            <label className="text-xs text-gray-500">Phase</label>
            <input type="range" min="0" max={Math.PI * 2} step="0.05" value={h.phase}
              onChange={e => setHarmonics(hs => hs.map((x, j) => j === i ? { ...x, phase: parseFloat(e.target.value) } : x))}
              className="w-full" style={{ accentColor: h.color }} />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600">White = composite · coloured = individual harmonics · phasor wheel (right) shows rotating components</p>
    </div>
  );
}

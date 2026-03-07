import { useRef, useEffect, useCallback, useState } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  mass: number; charge: number;
  radius: number; color: string; trail: [number, number][];
}

const PALETTE = ['#00d4ff', '#8b5cf6', '#f472b6', '#22c55e', '#f59e0b'];

function makeParticle(w: number, h: number, i: number): Particle {
  const charge = i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0;
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120,
    mass: 1 + Math.random() * 3,
    charge,
    radius: 5 + Math.random() * 6,
    color: PALETTE[i % PALETTE.length],
    trail: [],
  };
}

export default function ParticlePhysics() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const particles  = useRef<Particle[]>([]);
  const rafRef     = useRef(0);
  const dragRef    = useRef<{ idx: number; ox: number; oy: number } | null>(null);
  const [gravity, setGravity]  = useState(0);
  const [charge,  setCharge]   = useState(1);
  const [count,   setCount]    = useState(18);
  const gravRef   = useRef(gravity);
  const chargeRef = useRef(charge);
  useEffect(() => { gravRef.current = gravity; }, [gravity]);
  useEffect(() => { chargeRef.current = charge; }, [charge]);

  const reset = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    particles.current = Array.from({ length: count }, (_, i) => makeParticle(c.width, c.height, i));
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      reset();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    reset();

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();

    function loop(ts: number) {
      const dt = Math.min((ts - last) / 1000, 0.033); last = ts;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const ps = particles.current;
      const G = gravRef.current;
      const CE = chargeRef.current;

      // Physics
      ps.forEach((p, i) => {
        if (dragRef.current?.idx === i) return;
        let ax = 0, ay = G * 180; // gravity in px/s²
        ps.forEach((q, j) => {
          if (i === j) return;
          const dx = q.x - p.x, dy = q.y - p.y;
          const d2 = dx * dx + dy * dy;
          const d  = Math.sqrt(d2) + 1e-4;
          // Coulomb-like
          if (p.charge !== 0 && q.charge !== 0) {
            const k = CE * 4000 * p.charge * q.charge;
            ax -= k * dx / (d2 * d) * q.mass;
            ay -= k * dy / (d2 * d) * q.mass;
          }
          // Gravity between masses
          const gForce = G * p.mass * q.mass * 300 / (d2 + 400);
          ax += gForce * dx / d;
          ay += gForce * dy / d;
        });
        p.vx = (p.vx + ax * dt) * 0.998;
        p.vy = (p.vy + ay * dt) * 0.998;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Bounce off walls
        if (p.x < p.radius)       { p.x = p.radius;   p.vx *= -0.7; }
        if (p.x > W - p.radius)   { p.x = W-p.radius; p.vx *= -0.7; }
        if (p.y < p.radius)       { p.y = p.radius;   p.vy *= -0.7; }
        if (p.y > H - p.radius)   { p.y = H-p.radius; p.vy *= -0.7; }
        // Trail
        p.trail.push([p.x, p.y]);
        if (p.trail.length > 18) p.trail.shift();
      });

      // Draw trails
      ps.forEach(p => {
        if (p.trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(p.trail[0][0], p.trail[0][1]);
        p.trail.forEach(([tx, ty]) => ctx.lineTo(tx, ty));
        ctx.strokeStyle = p.color + '44';
        ctx.lineWidth = p.radius * 0.4;
        ctx.stroke();
      });

      // Draw particles
      ps.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(p.x - p.radius * 0.3, p.y - p.radius * 0.3, 0, p.x, p.y, p.radius * 1.8);
        grd.addColorStop(0, p.color + 'ff');
        grd.addColorStop(0.6, p.color + '88');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.shadowColor = p.color; ctx.shadowBlur = 14;
        ctx.fill(); ctx.shadowBlur = 0;
        // charge indicator
        if (p.charge !== 0) {
          ctx.fillStyle = p.charge > 0 ? '#22c55e' : '#ef4444';
          ctx.font = `bold ${p.radius}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(p.charge > 0 ? '+' : '−', p.x, p.y);
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // Drag
    function getIdx(x: number, y: number) {
      const r = canvas.getBoundingClientRect();
      const cx = x - r.left, cy = y - r.top;
      return particles.current.findIndex(p => Math.hypot(p.x - cx, p.y - cy) < p.radius + 8);
    }
    function onDown(e: PointerEvent) {
      const idx = getIdx(e.clientX, e.clientY);
      if (idx < 0) return;
      dragRef.current = { idx, ox: e.clientX, oy: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!dragRef.current) return;
      const r = canvas.getBoundingClientRect();
      const p = particles.current[dragRef.current.idx];
      p.x = e.clientX - r.left; p.y = e.clientY - r.top;
      p.vx = e.movementX * 60; p.vy = e.movementY * 60;
    }
    function onUp() { dragRef.current = null; }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [reset]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Gravity
          <input type="range" min="0" max="2" step="0.1" value={gravity}
            onChange={e => setGravity(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400" />
          <span className="text-cyan-300 w-6">{gravity.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Charge Force
          <input type="range" min="0" max="3" step="0.1" value={charge}
            onChange={e => setCharge(parseFloat(e.target.value))}
            className="w-24 accent-violet-400" />
          <span className="text-violet-300 w-6">{charge.toFixed(1)}</span>
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-400">
          Particles
          <input type="range" min="6" max="40" step="1" value={count}
            onChange={e => setCount(parseInt(e.target.value))}
            className="w-20 accent-pink-400" />
          <span className="text-pink-300 w-6">{count}</span>
        </label>
        <button onClick={reset}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors">
          🔄 Reset
        </button>
      </div>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-xl cursor-grab active:cursor-grabbing"
        style={{ background: 'rgba(5,5,20,0.6)', minHeight: 240 }} />
      <p className="text-xs text-gray-600">Drag particles · <span className="text-green-400">+</span> repels <span className="text-green-400">+</span> · <span className="text-red-400">−</span> attracts <span className="text-green-400">+</span> · neutral = no charge force</p>
    </div>
  );
}

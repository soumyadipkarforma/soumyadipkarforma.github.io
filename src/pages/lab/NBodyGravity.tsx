import { useRef, useEffect, useState, useCallback } from 'react';

interface Body {
  x: number; y: number;
  vx: number; vy: number;
  mass: number;
  radius: number;
  color: string;
  trail: [number, number][];
}

const COLORS = [
  '#00d4ff','#8b5cf6','#f472b6','#22c55e','#f59e0b',
  '#ff6644','#44ffcc','#ff44aa','#aaff44','#4466ff',
  '#ffaa00','#00ffaa','#ff0044','#44aaff','#ffff44',
  '#ff44ff','#44ffff','#ff8844','#88ff44','#4488ff',
];

function randomBody(w: number, h: number, i: number): Body {
  return {
    x:  w * 0.15 + Math.random() * w * 0.7,
    y:  h * 0.15 + Math.random() * h * 0.7,
    vx: (Math.random() - 0.5) * 40,
    vy: (Math.random() - 0.5) * 40,
    mass:   10 + Math.random() * 40,
    radius: 0,
    color:  COLORS[i % COLORS.length],
    trail:  [],
  };
}

function calcRadius(mass: number) {
  return Math.max(3, Math.sqrt(mass) * 1.4);
}

export default function NBodyGravity() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const bodiesRef  = useRef<Body[]>([]);
  const countRef   = useRef(8);
  const gRef       = useRef(300);
  const [count, setCount]  = useState(8);
  const [G,     setG]      = useState(300);

  useEffect(() => { countRef.current = count; }, [count]);
  useEffect(() => { gRef.current = G; }, [G]);

  const reset = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    bodiesRef.current = Array.from({ length: countRef.current }, (_, i) => {
      const b = randomBody(w, h, i);
      b.radius = calcRadius(b.mass);
      return b;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    reset();

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf = 0;

    function integrate(dt: number) {
      const bodies = bodiesRef.current;
      const G = gRef.current;
      const n = bodies.length;
      const ax = new Float64Array(n);
      const ay = new Float64Array(n);

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const dist2 = dx * dx + dy * dy;
          const dist  = Math.sqrt(dist2);
          const minD  = bodies[i].radius + bodies[j].radius;

          if (dist < minD) {
            // Merge: conserve momentum, add masses
            const m1 = bodies[i].mass, m2 = bodies[j].mass;
            const totalM = m1 + m2;
            bodies[i].vx = (bodies[i].vx * m1 + bodies[j].vx * m2) / totalM;
            bodies[i].vy = (bodies[i].vy * m1 + bodies[j].vy * m2) / totalM;
            bodies[i].x  = (bodies[i].x  * m1 + bodies[j].x  * m2) / totalM;
            bodies[i].y  = (bodies[i].y  * m1 + bodies[j].y  * m2) / totalM;
            bodies[i].mass   = totalM;
            bodies[i].radius = calcRadius(totalM);
            bodies.splice(j, 1);
            return;
          }

          const softened = dist2 + 100;
          const f = G / softened;
          const fx = f * dx / dist;
          const fy = f * dy / dist;

          ax[i] += fx * bodies[j].mass;
          ay[i] += fy * bodies[j].mass;
          ax[j] -= fx * bodies[i].mass;
          ay[j] -= fy * bodies[i].mass;
        }
      }

      for (let i = 0; i < n; i++) {
        bodies[i].vx += ax[i] * dt;
        bodies[i].vy += ay[i] * dt;
        bodies[i].x  += bodies[i].vx * dt;
        bodies[i].y  += bodies[i].vy * dt;

        // Bounce off walls
        const w = canvas!.width, h = canvas!.height;
        if (bodies[i].x < bodies[i].radius)      { bodies[i].x = bodies[i].radius;      bodies[i].vx *= -0.7; }
        if (bodies[i].x > w - bodies[i].radius)  { bodies[i].x = w - bodies[i].radius;  bodies[i].vx *= -0.7; }
        if (bodies[i].y < bodies[i].radius)      { bodies[i].y = bodies[i].radius;      bodies[i].vy *= -0.7; }
        if (bodies[i].y > h - bodies[i].radius)  { bodies[i].y = h - bodies[i].radius;  bodies[i].vy *= -0.7; }

        bodies[i].trail.push([bodies[i].x, bodies[i].y]);
        if (bodies[i].trail.length > 200) bodies[i].trail.shift();
      }
    }

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.033);
      last = ts;

      // Sub-step for stability
      const steps = 4;
      for (let s = 0; s < steps; s++) integrate(dt / steps);

      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = 'rgba(0,0,8,0.25)';
      ctx.fillRect(0, 0, w, h);

      for (const b of bodiesRef.current) {
        // Trail
        if (b.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(b.trail[0][0], b.trail[0][1]);
          for (let i = 1; i < b.trail.length; i++) ctx.lineTo(b.trail[i][0], b.trail[i][1]);
          ctx.strokeStyle = b.color + '55';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Glow
        const gd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * 3);
        gd.addColorStop(0,   b.color + 'cc');
        gd.addColorStop(0.5, b.color + '44');
        gd.addColorStop(1,   b.color + '00');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    function onClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const i = bodiesRef.current.length;
      const b: Body = {
        x, y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40,
        mass: 20, radius: calcRadius(20), color: COLORS[i % COLORS.length], trail: [],
      };
      bodiesRef.current.push(b);
    }

    canvas.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('click', onClick);
    };
  }, [reset]);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          Bodies: {count}
          <input
            type="range" min={2} max={20} step={1}
            value={count}
            onChange={e => setCount(parseInt(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </label>
        <label className="flex items-center gap-2">
          G: {G}
          <input
            type="range" min={50} max={1000} step={10}
            value={G}
            onChange={e => setG(parseInt(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </label>
        <button
          onClick={reset}
          className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-colors"
        >
          Reset
        </button>
        <span className="text-gray-600 italic">Click canvas to add a body</span>
      </div>
    </div>
  );
}

import { useRef, useEffect, useState, useCallback } from 'react';

interface Planet {
  name: string;
  color: string;
  r: number;
  orbit: number;
  period: number;
  fact: string;
}

const PLANETS: Planet[] = [
  { name: 'Mercury', color: '#b5b5b5', r: 3,  orbit: 60,  period: 0.24,  fact: 'Closest planet to the Sun' },
  { name: 'Venus',   color: '#e8d5a3', r: 5,  orbit: 95,  period: 0.62,  fact: 'Hottest planet in our solar system' },
  { name: 'Earth',   color: '#4fc3f7', r: 6,  orbit: 135, period: 1.0,   fact: 'Our home — the only known habitable world' },
  { name: 'Mars',    color: '#e07040', r: 4,  orbit: 180, period: 1.88,  fact: 'The Red Planet — humans are going there' },
  { name: 'Jupiter', color: '#c88b3a', r: 16, orbit: 260, period: 11.9,  fact: 'Largest planet — 1300 Earths fit inside' },
  { name: 'Saturn',  color: '#e4d191', r: 13, orbit: 340, period: 29.5,  fact: 'Has the most spectacular ring system' },
  { name: 'Uranus',  color: '#7de8e8', r: 9,  orbit: 410, period: 84,    fact: 'Rotates on its side — axial tilt 98°' },
  { name: 'Neptune', color: '#3f54ba', r: 8,  orbit: 470, period: 165,   fact: 'Fastest winds in the solar system' },
];

interface Star {
  x: number; y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
}

export default function SolarSystem() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const speedRef    = useRef(1);
  const timeRef     = useRef(0);
  const starsRef    = useRef<Star[]>([]);
  const [speed, setSpeed]   = useState(1);
  const [tooltip, setTooltip] = useState<{ name: string; fact: string } | null>(null);

  const speedStateRef = useRef(speed);
  useEffect(() => { speedStateRef.current = speed; speedRef.current = speed; }, [speed]);

  const buildStars = useCallback((w: number, h: number) => {
    starsRef.current = Array.from({ length: 500 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 1.5 + 0.5,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildStars(canvas.width, canvas.height);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildStars(canvas.width, canvas.height);

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf = 0;

    function getScale(w: number, h: number) {
      const minDim = Math.min(w, h);
      return minDim / 1000;
    }

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      timeRef.current += dt * speedRef.current;

      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const scale = getScale(w, h);

      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, w, h);

      // Stars
      const t = ts / 1000;
      for (const s of starsRef.current) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
      }

      // Orbital paths
      ctx.save();
      for (const p of PLANETS) {
        const orb = p.orbit * scale * 2.1;
        ctx.beginPath();
        ctx.arc(cx, cy, orb, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();

      // Sun glow
      const pulse = 1 + 0.07 * Math.sin(t * 2.5);
      const sunR = 28 * scale * 2.1;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 3.5 * pulse);
      grad.addColorStop(0,   'rgba(255,230,100,1)');
      grad.addColorStop(0.25,'rgba(255,160,30,0.8)');
      grad.addColorStop(0.6, 'rgba(255,80,0,0.2)');
      grad.addColorStop(1,   'rgba(255,60,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * 3.5 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe864';
      ctx.fill();

      // Planets
      for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i];
        const orb = p.orbit * scale * 2.1;
        const angle = (timeRef.current / p.period) * Math.PI * 2;
        const px = cx + orb * Math.cos(angle);
        const py = cy + orb * Math.sin(angle);
        const pr = p.r * scale * 2.1;

        // Saturn rings
        if (p.name === 'Saturn') {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.35);
          for (let ri = 0; ri < 3; ri++) {
            const inner = pr * (1.5 + ri * 0.55);
            const outer = pr * (2.0 + ri * 0.55);
            const rg = ctx.createRadialGradient(0, 0, inner, 0, 0, outer);
            rg.addColorStop(0,   'rgba(220,200,130,0.0)');
            rg.addColorStop(0.3, `rgba(220,200,130,${0.35 - ri * 0.08})`);
            rg.addColorStop(1,   'rgba(220,200,130,0.0)');
            ctx.beginPath();
            ctx.arc(0, 0, outer, 0, Math.PI * 2);
            ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
            ctx.fillStyle = rg;
            ctx.fill();
          }
          ctx.restore();
        }

        // Planet glow
        const glowR = pr * 2.5;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0,   p.color + 'aa');
        glow.addColorStop(0.5, p.color + '44');
        glow.addColorStop(1,   p.color + '00');
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, Math.max(pr, 1.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Moon for Earth
        if (p.name === 'Earth') {
          const moonAngle = timeRef.current * 13 * Math.PI * 2;
          const moonOrb  = pr * 3.5;
          const mx = px + moonOrb * Math.cos(moonAngle);
          const my = py + moonOrb * Math.sin(moonAngle);
          ctx.beginPath();
          ctx.arc(mx, my, Math.max(pr * 0.35, 1.2), 0, Math.PI * 2);
          ctx.fillStyle = '#cccccc';
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    // Mouse hover detection
    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const scale = getScale(w, h);

      for (const p of PLANETS) {
        const orb = p.orbit * scale * 2.1;
        const angle = (timeRef.current / p.period) * Math.PI * 2;
        const px = cx + orb * Math.cos(angle);
        const py = cy + orb * Math.sin(angle);
        const pr = p.r * scale * 2.1;
        const dist = Math.hypot(mx - px, my - py);
        if (dist < Math.max(pr, 8) + 8) {
          setTooltip({ name: p.name, fact: p.fact });
          return;
        }
      }
      setTooltip(null);
    }

    canvas.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, [buildStars]);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          Speed: {speed.toFixed(1)}x
          <input
            type="range" min={0.1} max={5} step={0.1}
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </label>
        {tooltip && (
          <span className="text-cyan-400 font-semibold">
            {tooltip.name}: <span className="text-gray-300 font-normal">{tooltip.fact}</span>
          </span>
        )}
        {!tooltip && <span className="text-gray-600 italic">Hover over a planet to learn more</span>}
      </div>
    </div>
  );
}

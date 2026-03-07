import { useRef, useEffect, useState, useCallback } from 'react';

interface GalaxyStar {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  alpha: number;
  orbitalR: number;
  angle: number;
  angularSpeed: number;
  arm: number;
}

function hsl(h: number, s: number, l: number, a = 1) {
  return `hsla(${h},${s}%,${l}%,${a})`;
}

function makeGalaxy(cx: number, cy: number, count: number): GalaxyStar[] {
  const stars: GalaxyStar[] = [];
  const NUM_ARMS = 2;
  const ARM_TWIST = 4.5;

  // Central bulge
  for (let i = 0; i < count * 0.25; i++) {
    const r = Math.random() * 80 * (0.3 + Math.random() * 0.7);
    const angle = Math.random() * Math.PI * 2;
    const brightness = 70 + Math.random() * 30;
    const hue = 40 + Math.random() * 30;
    stars.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle) * 0.6,
      vx: 0, vy: 0,
      r: Math.random() * 1.5 + 0.3,
      color: hsl(hue, 20, brightness),
      alpha: 0.5 + Math.random() * 0.5,
      orbitalR: r,
      angle: angle,
      angularSpeed: 0.00015 / Math.max(r / 80, 0.15),
      arm: -1,
    });
  }

  // Spiral arms
  for (let i = 0; i < count * 0.75; i++) {
    const arm = i % NUM_ARMS;
    const t = Math.random();
    const r = 80 + t * 400;
    const armAngle = (arm * Math.PI * 2) / NUM_ARMS;
    const spiralAngle = armAngle + ARM_TWIST * t + (Math.random() - 0.5) * 0.8;
    const scatter = (Math.random() - 0.5) * 40 * (1 - t * 0.5);

    const bx = cx + r * Math.cos(spiralAngle) + scatter * Math.cos(spiralAngle + Math.PI / 2);
    const by = cy + (r * Math.sin(spiralAngle) + scatter * Math.sin(spiralAngle + Math.PI / 2)) * 0.55;

    // Color: core=yellow/white, outer=blue/white
    const hue = t < 0.4 ? 40 + Math.random() * 40 : 200 + Math.random() * 60;
    const sat = t < 0.4 ? 30 : 60 + Math.random() * 40;
    const brightness = 60 + Math.random() * 40;

    stars.push({
      x: bx, y: by,
      vx: 0, vy: 0,
      r: Math.random() * 1.8 + 0.3,
      color: hsl(hue, sat, brightness),
      alpha: 0.3 + Math.random() * 0.7,
      orbitalR: r,
      angle: spiralAngle,
      angularSpeed: 0.00012 / Math.max(r / 200, 0.5),
      arm,
    });
  }

  return stars;
}

export default function GalaxyFormation() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const starsRef   = useRef<GalaxyStar[]>([]);
  const rotSpeedRef = useRef(1);
  const [rotSpeed, setRotSpeed] = useState(1);

  useEffect(() => { rotSpeedRef.current = rotSpeed; }, [rotSpeed]);

  const reset = useCallback((w: number, h: number) => {
    starsRef.current = makeGalaxy(w / 2, h / 2, 4000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      reset(canvas.width, canvas.height);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    reset(canvas.width, canvas.height);

    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    function loop(_ts: number) {
      if (!canvas) return;
      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const spd = rotSpeedRef.current;

      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, w, h);

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      coreGrad.addColorStop(0,   'rgba(180,120,255,0.18)');
      coreGrad.addColorStop(0.5, 'rgba(120,60,200,0.08)');
      coreGrad.addColorStop(1,   'rgba(60,0,120,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Update + draw stars
      const stars = starsRef.current;
      for (const s of stars) {
        // Differential rotation: inner spins faster
        const speed = s.angularSpeed * spd;
        s.angle += speed;
        const cosA = Math.cos(s.angle);
        const sinA = Math.sin(s.angle);
        s.x = cx + s.orbitalR * cosA;
        s.y = cy + s.orbitalR * sinA * (s.arm === -1 ? 0.6 : 0.55);

        if (s.x < 0 || s.x > w || s.y < 0 || s.y > h) continue;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color.replace(/,[\d.]+\)$/, `,${s.alpha})`);
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    function onClick(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const burst: GalaxyStar[] = [];
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 30;
        const bx = mx + r * Math.cos(angle);
        const by = my + r * Math.sin(angle);
        const orb = Math.hypot(bx - cx, (by - cy) / 0.55);
        burst.push({
          x: bx, y: by, vx: 0, vy: 0,
          r: Math.random() * 2 + 0.5,
          color: hsl(180 + Math.random() * 60, 80, 80),
          alpha: 0.8 + Math.random() * 0.2,
          orbitalR: orb,
          angle: Math.atan2((by - cy) / 0.55, bx - cx),
          angularSpeed: 0.00012 / Math.max(orb / 200, 0.3),
          arm: 0,
        });
      }
      starsRef.current.push(...burst);
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
          Rotation Speed: {rotSpeed.toFixed(1)}x
          <input
            type="range" min={0.1} max={5} step={0.1}
            value={rotSpeed}
            onChange={e => setRotSpeed(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </label>
        <span className="text-gray-600 italic">Click anywhere to add a star burst</span>
      </div>
    </div>
  );
}

import { useRef, useEffect, useState } from 'react';

interface AccretionParticle {
  angle: number;
  radius: number;
  speed: number;
  alpha: number;
  color: string;
  size: number;
}

interface TestParticle {
  x: number; y: number;
  vx: number; vy: number;
  trail: [number, number][];
  dead: boolean;
  color: string;
}

interface LensedStar {
  baseX: number; baseY: number;
  alpha: number;
  size: number;
}

function accretionColor(r: number, maxR: number) {
  const t = 1 - r / maxR;
  if (t > 0.7) return `rgba(255,255,220,${0.8 + t * 0.2})`;
  if (t > 0.4) return `rgba(255,200,80,${0.6 + t * 0.3})`;
  if (t > 0.2) return `rgba(255,120,20,${0.4 + t * 0.4})`;
  return `rgba(200,60,0,${0.3 + t * 0.3})`;
}

export default function BlackHole() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const massRef    = useRef(1);
  const accRef     = useRef<AccretionParticle[]>([]);
  const testRef    = useRef<TestParticle[]>([]);
  const starsRef   = useRef<LensedStar[]>([]);
  const timeRef    = useRef(0);
  const [mass, setMass] = useState(1);

  useEffect(() => { massRef.current = mass; }, [mass]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function buildAccretion(m: number) {
      const count = 600;
      const particles: AccretionParticle[] = [];
      for (let i = 0; i < count; i++) {
        const r = 60 * m + Math.random() * 120 * m;
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: r,
          speed: (0.8 + Math.random() * 0.6) / Math.sqrt(r / (60 * m)),
          alpha: 0.3 + Math.random() * 0.7,
          color: accretionColor(r, 180 * m),
          size: 0.8 + Math.random() * 2.5,
        });
      }
      accRef.current = particles;
    }

    function buildStars(w: number, h: number) {
      starsRef.current = Array.from({ length: 200 }, () => ({
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        alpha: 0.3 + Math.random() * 0.7,
        size: Math.random() * 1.5 + 0.3,
      }));
    }

    function spawnTestParticles(cx: number, cy: number, m: number) {
      const colors = ['#00d4ff','#8b5cf6','#f472b6','#22c55e','#f59e0b','#ff6644'];
      testRef.current = Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        const startR = 280 * m + 40;
        return {
          x: cx + startR * Math.cos(angle),
          y: cy + startR * Math.sin(angle),
          vx: -Math.sin(angle) * Math.sqrt(5000 * m / startR) * 0.5,
          vy:  Math.cos(angle) * Math.sqrt(5000 * m / startR) * 0.5,
          trail: [] as [number, number][],
          dead: false,
          color: colors[i],
        };
      });
    }

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildStars(canvas.width, canvas.height);
      buildAccretion(massRef.current);
      spawnTestParticles(canvas.width / 2, canvas.height / 2, massRef.current);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buildStars(canvas.width, canvas.height);
    buildAccretion(massRef.current);
    spawnTestParticles(canvas.width / 2, canvas.height / 2, massRef.current);

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf = 0;
    let prevMass = massRef.current;

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      timeRef.current += dt;

      const m = massRef.current;
      if (Math.abs(m - prevMass) > 0.05) {
        buildAccretion(m);
        spawnTestParticles(canvas.width / 2, canvas.height / 2, m);
        prevMass = m;
      }

      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const bhR = 40 * m;
      const t = timeRef.current;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Lensed star field: warp stars near hole
      for (const s of starsRef.current) {
        const dx = s.baseX - cx, dy = s.baseY - cy;
        const dist = Math.hypot(dx, dy);
        const warpR = 180 * m;
        let sx = s.baseX, sy = s.baseY;
        if (dist < warpR && dist > 1) {
          const strength = (warpR - dist) / warpR;
          const pushOut = strength * strength * 60 * m;
          sx = cx + (dx / dist) * (dist + pushOut);
          sy = cy + (dy / dist) * (dist + pushOut);
        }
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      }

      // Accretion disk (back half — behind hole)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.3);
      const backParticles = accRef.current.filter(p => Math.sin(p.angle) < 0);
      for (const p of backParticles) {
        p.angle += p.speed * dt * 0.8;
        const px = p.radius * Math.cos(p.angle);
        const py = p.radius * Math.sin(p.angle);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, bhR, cx, cy, bhR * 5);
      outerGlow.addColorStop(0,   'rgba(100,30,0,0.0)');
      outerGlow.addColorStop(0.3, 'rgba(80,20,0,0.0)');
      outerGlow.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, bhR * 5, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Event horizon
      const bhGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bhR * 1.3);
      bhGrad.addColorStop(0,   'rgba(0,0,0,1)');
      bhGrad.addColorStop(0.85,'rgba(0,0,0,1)');
      bhGrad.addColorStop(1,   'rgba(10,5,20,0.9)');
      ctx.beginPath();
      ctx.arc(cx, cy, bhR * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = bhGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, bhR, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Photon sphere ring
      ctx.beginPath();
      ctx.arc(cx, cy, bhR * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,180,60,0.15)';
      ctx.lineWidth = 3 * m;
      ctx.stroke();

      // Relativistic jets
      const jetLen = 180 * m;
      for (const dir of [-1, 1]) {
        const jetGrad = ctx.createLinearGradient(cx, cy, cx, cy + dir * jetLen);
        jetGrad.addColorStop(0,   'rgba(150,200,255,0.8)');
        jetGrad.addColorStop(0.4, 'rgba(100,150,255,0.4)');
        jetGrad.addColorStop(1,   'rgba(60,100,255,0)');
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.moveTo(-8 * m, 0);
        ctx.lineTo(8 * m, 0);
        ctx.lineTo(3 * m, dir * jetLen);
        ctx.lineTo(-3 * m, dir * jetLen);
        ctx.closePath();
        ctx.fillStyle = jetGrad;
        ctx.fill();

        // Pulsing bright core of jet
        const pulse = 0.6 + 0.4 * Math.sin(t * 8 + dir);
        const jcGrad = ctx.createLinearGradient(0, 0, 0, dir * jetLen * 0.5);
        jcGrad.addColorStop(0,   `rgba(255,255,255,${pulse * 0.9})`);
        jcGrad.addColorStop(1,   'rgba(200,220,255,0)');
        ctx.beginPath();
        ctx.moveTo(-3 * m, 0);
        ctx.lineTo(3 * m, 0);
        ctx.lineTo(1 * m, dir * jetLen * 0.5);
        ctx.lineTo(-1 * m, dir * jetLen * 0.5);
        ctx.closePath();
        ctx.fillStyle = jcGrad;
        ctx.fill();
        ctx.restore();
      }

      // Accretion disk (front half — in front of hole)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.3);
      const frontParticles = accRef.current.filter(p => Math.sin(p.angle) >= 0);
      for (const p of frontParticles) {
        p.angle += p.speed * dt * 0.8;
        const px = p.radius * Math.cos(p.angle);
        const py = p.radius * Math.sin(p.angle);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.restore();

      // Test particles spiraling in
      for (const tp of testRef.current) {
        if (tp.dead) continue;
        const dx = cx - tp.x, dy = cy - tp.y;
        const dist = Math.hypot(dx, dy);
        if (dist < bhR * 1.1) { tp.dead = true; continue; }
        const G = 8000 * m;
        const acc = G / (dist * dist);
        const nx = dx / dist, ny = dy / dist;
        tp.vx += nx * acc * dt;
        tp.vy += ny * acc * dt;

        // Tiny drag to spiral in
        tp.vx *= 0.999;
        tp.vy *= 0.999;

        tp.x += tp.vx * dt;
        tp.y += tp.vy * dt;
        tp.trail.push([tp.x, tp.y]);
        if (tp.trail.length > 200) tp.trail.shift();

        if (tp.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(tp.trail[0][0], tp.trail[0][1]);
          for (let i = 1; i < tp.trail.length; i++) {
            ctx.lineTo(tp.trail[i][0], tp.trail[i][1]);
          }
          ctx.strokeStyle = tp.color + '88';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = tp.color;
        ctx.fill();
      }

      // Re-spawn dead test particles
      if (testRef.current.every(tp => tp.dead)) {
        spawnTestParticles(cx, cy, m);
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000000', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          Mass: {mass.toFixed(1)}M☉
          <input
            type="range" min={0.4} max={3} step={0.1}
            value={mass}
            onChange={e => setMass(parseFloat(e.target.value))}
            className="w-24 accent-cyan-400"
          />
        </label>
        <span className="text-gray-600 italic">Adjust mass to scale the black hole</span>
      </div>
    </div>
  );
}

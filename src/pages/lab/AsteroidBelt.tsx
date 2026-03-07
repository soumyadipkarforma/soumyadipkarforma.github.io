import { useRef, useEffect, useState, useCallback } from 'react';

interface Asteroid {
  angle: number;
  radius: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
  size: number;
  vertices: [number, number][];
  color: string;
  exploding: boolean;
  explodeT: number;
  explodeParticles: ExplodeParticle[];
}

interface ExplodeParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  color: string;
  size: number;
}

interface Comet {
  x: number; y: number;
  vx: number; vy: number;
  active: boolean;
  life: number;
  trail: [number, number][];
}

const SCALE = 0.55;
const SUN_R = 18;
const MARS_ORBIT = 180 * SCALE;
const JUP_ORBIT  = 260 * SCALE;
const BELT_MIN   = 190 * SCALE;
const BELT_MAX   = 255 * SCALE;

// Kirkwood gap resonances: fractions of Jupiter period
const KIRKWOOD_GAPS = [
  { ratio: 1/3, width: 6 * SCALE },
  { ratio: 2/5, width: 5 * SCALE },
  { ratio: 1/2, width: 7 * SCALE },
];
// Jupiter orbital period (years) — reference for Kirkwood gap resonance ratios

function isInGap(r: number): boolean {
  for (const g of KIRKWOOD_GAPS) {
    const gapR = Math.cbrt(g.ratio * g.ratio) * JUP_ORBIT;
    if (Math.abs(r - gapR) < g.width / 2) return true;
  }
  return false;
}

function makeVertices(n: number, size: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = size * (0.6 + Math.random() * 0.4);
    return [r * Math.cos(a), r * Math.sin(a)];
  });
}

function asteroidColor() {
  const g = 120 + Math.floor(Math.random() * 80);
  return `rgb(${g},${g - 10},${g - 20})`;
}

function makeAsteroid(): Asteroid {
  let r: number;
  let tries = 0;
  do {
    r = BELT_MIN + Math.random() * (BELT_MAX - BELT_MIN);
    tries++;
  } while (isInGap(r) && tries < 20);

  const vn = 5 + Math.floor(Math.random() * 4);
  const sz = 2 + Math.random() * 6;
  return {
    angle:    Math.random() * Math.PI * 2,
    radius:   r,
    speed:    (0.5 + Math.random() * 0.5) * 0.4 / Math.sqrt(r / MARS_ORBIT),
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    size:     sz,
    vertices: makeVertices(vn, sz),
    color:    asteroidColor(),
    exploding: false,
    explodeT:  0,
    explodeParticles: [],
  };
}

function makeComet(w: number, h: number): Comet {
  const side = Math.floor(Math.random() * 4);
  let x: number, y: number, vx: number, vy: number;
  const cx = w / 2, cy = h / 2;
  const speed = 80 + Math.random() * 60;
  if (side === 0) { x = -40; y = Math.random() * h; }
  else if (side === 1) { x = w + 40; y = Math.random() * h; }
  else if (side === 2) { x = Math.random() * w; y = -40; }
  else { x = Math.random() * w; y = h + 40; }
  const dx = cx + (Math.random() - 0.5) * 100 - x;
  const dy = cy + (Math.random() - 0.5) * 100 - y;
  const d  = Math.hypot(dx, dy);
  vx = (dx / d) * speed;
  vy = (dy / d) * speed;
  return { x, y, vx, vy, active: true, life: 1.0, trail: [] };
}

export default function AsteroidBelt() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const cometRef     = useRef<Comet | null>(null);
  const timeRef      = useRef(0);
  const [asteroidCount] = useState(300);

  const reset = useCallback((_cx: number, _cy: number) => {
    asteroidsRef.current = Array.from({ length: asteroidCount }, makeAsteroid);
    cometRef.current = null;
  }, [asteroidCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      reset(canvas.width / 2, canvas.height / 2);
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    reset(canvas.width / 2, canvas.height / 2);

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf = 0;
    let cometTimer = 10;

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      timeRef.current += dt;
      const t = timeRef.current;

      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;

      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, w, h);

      // Background stars
      ctx.save();
      for (let i = 0; i < 150; i++) {
        const sx = ((i * 137.508 * 3) % w);
        const sy = ((i * 97.3 * 7)    % h);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.5 + (i % 3) * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + (i % 5) * 0.12})`;
        ctx.fill();
      }
      ctx.restore();

      // Orbit guides
      ctx.save();
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      for (const orb of [MARS_ORBIT, JUP_ORBIT]) {
        ctx.beginPath(); ctx.arc(cx, cy, orb, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Belt density zones (Kirkwood gaps shaded differently)
      for (const g of KIRKWOOD_GAPS) {
        const gapR = Math.cbrt(g.ratio * g.ratio) * JUP_ORBIT;
        ctx.beginPath();
        ctx.arc(cx, cy, gapR + g.width / 2, 0, Math.PI * 2);
        ctx.arc(cx, cy, gapR - g.width / 2, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(100,0,200,0.03)';
        ctx.fill();
      }

      // Sun
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUN_R * 4);
      sunGlow.addColorStop(0,   'rgba(255,220,80,0.6)');
      sunGlow.addColorStop(0.4, 'rgba(255,120,0,0.2)');
      sunGlow.addColorStop(1,   'rgba(255,60,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, SUN_R * 4, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, SUN_R, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe864'; ctx.fill();

      // Mars
      const marsAngle = t * 0.53;
      const mx = cx + MARS_ORBIT * Math.cos(marsAngle);
      const my = cy + MARS_ORBIT * Math.sin(marsAngle);
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#e07040'; ctx.fill();

      // Jupiter
      const jupAngle = t * 0.084;
      const jx = cx + JUP_ORBIT * Math.cos(jupAngle);
      const jy = cy + JUP_ORBIT * Math.sin(jupAngle);
      ctx.beginPath(); ctx.arc(jx, jy, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#c88b3a'; ctx.fill();

      // Asteroids
      for (const a of asteroidsRef.current) {
        a.angle    += a.speed * dt;
        a.rotation += a.rotSpeed;

        if (a.exploding) {
          a.explodeT += dt;
          for (const ep of a.explodeParticles) {
            ep.x += ep.vx * dt;
            ep.y += ep.vy * dt;
            ep.life -= dt * 2;
            if (ep.life > 0) {
              ctx.beginPath();
              ctx.arc(ep.x, ep.y, ep.size, 0, Math.PI * 2);
              ctx.fillStyle = ep.color + Math.floor(ep.life * 255).toString(16).padStart(2, '0');
              ctx.fill();
            }
          }
          if (a.explodeT > 1.2) { a.exploding = false; a.explodeParticles = []; }
          continue;
        }

        const ax = cx + a.radius * Math.cos(a.angle);
        const ay = cy + a.radius * Math.sin(a.angle);

        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(a.rotation);
        ctx.beginPath();
        ctx.moveTo(a.vertices[0][0], a.vertices[0][1]);
        for (let vi = 1; vi < a.vertices.length; vi++) ctx.lineTo(a.vertices[vi][0], a.vertices[vi][1]);
        ctx.closePath();
        ctx.fillStyle = a.color;
        ctx.fill();
        ctx.restore();
      }

      // Comet timer
      cometTimer -= dt;
      if (cometTimer <= 0) {
        cometRef.current = makeComet(w, h);
        cometTimer = 15 + Math.random() * 20;
      }

      // Draw comet
      if (cometRef.current && cometRef.current.active) {
        const comet = cometRef.current;
        comet.x += comet.vx * dt;
        comet.y += comet.vy * dt;
        comet.trail.push([comet.x, comet.y]);
        if (comet.trail.length > 60) comet.trail.shift();

        if (comet.x < -100 || comet.x > w + 100 || comet.y < -100 || comet.y > h + 100) {
          cometRef.current = null;
        } else {
          // Tail
          const tlen = comet.trail.length;
          for (let i = 1; i < tlen; i++) {
            const alpha = (i / tlen) * 0.8;
            ctx.beginPath();
            ctx.moveTo(comet.trail[i - 1][0], comet.trail[i - 1][1]);
            ctx.lineTo(comet.trail[i][0], comet.trail[i][1]);
            ctx.strokeStyle = `rgba(180,220,255,${alpha})`;
            ctx.lineWidth = (i / tlen) * 3;
            ctx.stroke();
          }
          // Head glow
          const cg = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, 10);
          cg.addColorStop(0,   'rgba(255,255,255,1)');
          cg.addColorStop(0.5, 'rgba(150,220,255,0.5)');
          cg.addColorStop(1,   'rgba(100,180,255,0)');
          ctx.beginPath(); ctx.arc(comet.x, comet.y, 10, 0, Math.PI * 2);
          ctx.fillStyle = cg; ctx.fill();
        }
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

      for (const a of asteroidsRef.current) {
        if (a.exploding) continue;
        const ax = cx + a.radius * Math.cos(a.angle);
        const ay = cy + a.radius * Math.sin(a.angle);
        if (Math.hypot(mx - ax, my - ay) < a.size + 6) {
          a.exploding = true;
          a.explodeT  = 0;
          a.explodeParticles = Array.from({ length: 20 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const spd = 30 + Math.random() * 60;
            return {
              x: ax, y: ay,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 1.0,
              color: ['#ff8844','#ffcc44','#ff4422'][Math.floor(Math.random() * 3)],
              size: 1 + Math.random() * 2.5,
            };
          });
          break;
        }
      }
    }

    canvas.addEventListener('click', onClick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); canvas.removeEventListener('click', onClick); };
  }, [reset]);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <span>300 asteroids · Kirkwood gaps visible (purple shading) · Comets appear periodically</span>
        <span className="text-gray-600 italic">Click an asteroid to mine it</span>
      </div>
    </div>
  );
}

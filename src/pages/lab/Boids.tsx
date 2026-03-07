import { useRef, useEffect, useState, useCallback } from 'react';

interface Boid {
  x: number; y: number;
  vx: number; vy: number;
  trail: [number, number][];
}

interface BoidParams {
  separation: number;
  alignment:  number;
  cohesion:   number;
  speed:      number;
}

const PERCEPTION_R  = 80;
const SEPARATION_R  = 28;
const TRAIL_LEN     = 15;
const PREDATOR_R    = 150;

function hue(vx: number, vy: number): string {
  const angle = Math.atan2(vy, vx) * (180 / Math.PI);
  return `hsl(${(angle + 360) % 360},100%,65%)`;
}

function makeBoid(w: number, h: number): Boid {
  const angle = Math.random() * Math.PI * 2;
  const spd   = 1.5 + Math.random() * 0.5;
  return {
    x: Math.random() * w, y: Math.random() * h,
    vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
    trail: [],
  };
}

export default function Boids() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const boidsRef    = useRef<Boid[]>([]);
  const paramsRef   = useRef<BoidParams>({ separation: 1.5, alignment: 1.0, cohesion: 1.0, speed: 1.5 });
  const predatorRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const [separation, setSeparation] = useState(1.5);
  const [alignment,  setAlignment]  = useState(1.0);
  const [cohesion,   setCohesion]   = useState(1.0);
  const [speed,      setSpeed]      = useState(1.5);
  const [predatorOn, setPredatorOn] = useState(false);

  useEffect(() => {
    paramsRef.current = { separation, alignment, cohesion, speed };
  }, [separation, alignment, cohesion, speed]);

  useEffect(() => {
    predatorRef.current.active = predatorOn;
  }, [predatorOn]);

  const init = useCallback((w: number, h: number) => {
    boidsRef.current = Array.from({ length: 150 }, () => makeBoid(w, h));
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
    init(canvas.width, canvas.height);

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf  = 0;

    function update(dt: number, w: number, h: number) {
      const boids = boidsRef.current;
      const p = paramsRef.current;
      const pred = predatorRef.current;

      for (const boid of boids) {
        let sepX = 0, sepY = 0;
        let aliX = 0, aliY = 0;
        let cohX = 0, cohY = 0;
        let neighbors = 0;
        let sepCount  = 0;

        for (const other of boids) {
          if (other === boid) continue;
          const dx = other.x - boid.x;
          const dy = other.y - boid.y;
          const d  = Math.hypot(dx, dy);
          if (d < PERCEPTION_R) {
            aliX += other.vx; aliY += other.vy;
            cohX += other.x;  cohY += other.y;
            neighbors++;
            if (d < SEPARATION_R && d > 0) {
              sepX -= dx / d; sepY -= dy / d;
              sepCount++;
            }
          }
        }

        let steerX = 0, steerY = 0;

        if (sepCount > 0) {
          const sx = sepX / sepCount, sy = sepY / sepCount;
          const sd = Math.hypot(sx, sy);
          if (sd > 0) {
            steerX += (sx / sd) * p.speed * p.separation;
            steerY += (sy / sd) * p.speed * p.separation;
          }
        }

        if (neighbors > 0) {
          // Alignment
          const ax = aliX / neighbors, ay = aliY / neighbors;
          const ad = Math.hypot(ax, ay);
          if (ad > 0) {
            steerX += ((ax / ad) * p.speed - boid.vx) * p.alignment * 0.1;
            steerY += ((ay / ad) * p.speed - boid.vy) * p.alignment * 0.1;
          }
          // Cohesion
          const tx = cohX / neighbors - boid.x;
          const ty = cohY / neighbors - boid.y;
          const td = Math.hypot(tx, ty);
          if (td > 0) {
            steerX += (tx / td) * p.cohesion * 0.08;
            steerY += (ty / td) * p.cohesion * 0.08;
          }
        }

        // Predator avoidance
        if (pred.active) {
          const pdx = boid.x - pred.x;
          const pdy = boid.y - pred.y;
          const pd  = Math.hypot(pdx, pdy);
          if (pd < PREDATOR_R && pd > 0) {
            const strength = (1 - pd / PREDATOR_R) * 4;
            steerX += (pdx / pd) * p.speed * strength;
            steerY += (pdy / pd) * p.speed * strength;
          }
        }

        boid.vx += steerX * dt * 30;
        boid.vy += steerY * dt * 30;

        const spd = Math.hypot(boid.vx, boid.vy);
        const targetSpd = p.speed;
        if (spd > 0) {
          boid.vx = (boid.vx / spd) * targetSpd;
          boid.vy = (boid.vy / spd) * targetSpd;
        }

        boid.trail.push([boid.x, boid.y]);
        if (boid.trail.length > TRAIL_LEN) boid.trail.shift();

        boid.x += boid.vx * dt * 60;
        boid.y += boid.vy * dt * 60;

        // Wrap
        if (boid.x < 0) boid.x += w;
        if (boid.x > w) boid.x -= w;
        if (boid.y < 0) boid.y += h;
        if (boid.y > h) boid.y -= h;
      }
    }

    function drawBoid(ctx: CanvasRenderingContext2D, boid: Boid) {
      const angle = Math.atan2(boid.vy, boid.vx);
      const color = hue(boid.vx, boid.vy);
      const size  = 7;

      // Trail
      if (boid.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(boid.trail[0][0], boid.trail[0][1]);
        for (let i = 1; i < boid.trail.length; i++) ctx.lineTo(boid.trail[i][0], boid.trail[i][1]);
        ctx.strokeStyle = color + '55';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Triangle
      ctx.save();
      ctx.translate(boid.x, boid.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.6, size * 0.5);
      ctx.lineTo(-size * 0.6, -size * 0.5);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const w = canvas.width, h = canvas.height;

      update(dt, w, h);

      ctx.fillStyle = 'rgba(0,0,8,0.3)';
      ctx.fillRect(0, 0, w, h);

      const pred = predatorRef.current;
      if (pred.active) {
        const pg = ctx.createRadialGradient(pred.x, pred.y, 0, pred.x, pred.y, PREDATOR_R);
        pg.addColorStop(0,   'rgba(255,50,50,0.15)');
        pg.addColorStop(0.5, 'rgba(200,30,30,0.05)');
        pg.addColorStop(1,   'rgba(200,0,0,0)');
        ctx.beginPath();
        ctx.arc(pred.x, pred.y, PREDATOR_R, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();

        // Predator dot
        ctx.beginPath();
        ctx.arc(pred.x, pred.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3333';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pred.x, pred.y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,50,50,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      for (const b of boidsRef.current) drawBoid(ctx, b);

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    function onMouseMove(e: MouseEvent) {
      if (!predatorRef.current.active) return;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      predatorRef.current.x = e.clientX - rect.left;
      predatorRef.current.y = e.clientY - rect.top;
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      setPredatorOn(prev => !prev);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'p' || e.key === 'P') setPredatorOn(prev => !prev);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [init]);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400, cursor: predatorOn ? 'crosshair' : 'default' }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          Separation: {separation.toFixed(1)}
          <input type="range" min={0} max={3} step={0.1} value={separation}
            onChange={e => setSeparation(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          Alignment: {alignment.toFixed(1)}
          <input type="range" min={0} max={3} step={0.1} value={alignment}
            onChange={e => setAlignment(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          Cohesion: {cohesion.toFixed(1)}
          <input type="range" min={0} max={3} step={0.1} value={cohesion}
            onChange={e => setCohesion(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          Speed: {speed.toFixed(1)}
          <input type="range" min={0.5} max={3} step={0.1} value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <button
          onClick={() => {
            const c = canvasRef.current;
            if (!c) return;
            for (let i = 0; i < 50; i++) boidsRef.current.push(makeBoid(c.width, c.height));
          }}
          className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-colors"
        >
          +50 Boids
        </button>
        <button
          onClick={() => setPredatorOn(p => !p)}
          className={`px-3 py-1 rounded transition-colors ${predatorOn ? 'bg-red-500/40 text-red-300' : 'bg-red-500/10 hover:bg-red-500/25 text-red-400'}`}
        >
          {predatorOn ? 'Predator ON' : 'Predator OFF'}
        </button>
        <span className="text-gray-600 italic">Press P or right-click to toggle predator · Move mouse to steer</span>
      </div>
    </div>
  );
}

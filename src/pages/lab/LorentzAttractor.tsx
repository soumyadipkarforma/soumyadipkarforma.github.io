import { useRef, useEffect, useState } from 'react';

const TRAIL_LEN = 2000;
const NUM_TRAJ  = 6;

const TRAJ_COLORS = [
  '#00d4ff', '#8b5cf6', '#f472b6', '#22c55e', '#f59e0b', '#ff6644',
];

interface Trajectory {
  points: Float32Array; // interleaved x,y,z
  head:   number;
  count:  number;
  x: number; y: number; z: number;
  color: string;
}

function lorenzStep(
  x: number, y: number, z: number,
  sigma: number, rho: number, beta: number, dt: number
): [number, number, number] {
  const dx = sigma * (y - x);
  const dy = x * (rho - z) - y;
  const dz = x * y - beta * z;
  return [x + dx * dt, y + dy * dt, z + dz * dt];
}

function makeTrajectory(i: number): Trajectory {
  const eps = i * 0.01;
  return {
    points: new Float32Array(TRAIL_LEN * 3),
    head: 0, count: 0,
    x: 0.1 + eps, y: 0.1 + eps, z: 20 + eps * 2,
    color: TRAJ_COLORS[i % TRAJ_COLORS.length],
  };
}

export default function LorentzAttractor() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sigmaRef   = useRef(10);
  const rhoRef     = useRef(28);
  const betaRef    = useRef(8 / 3);
  const trajRef    = useRef<Trajectory[]>(Array.from({ length: NUM_TRAJ }, (_, i) => makeTrajectory(i)));
  const angleRef   = useRef(0);
  const [sigma, setSigma] = useState(10);
  const [rho,   setRho]   = useState(28);
  const [beta,  setBeta]  = useState(2.67);

  useEffect(() => { sigmaRef.current = sigma; }, [sigma]);
  useEffect(() => { rhoRef.current   = rho;   }, [rho]);
  useEffect(() => { betaRef.current  = beta;  }, [beta]);

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

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf  = 0;

    function project(x: number, y: number, z: number, angle: number, w: number, h: number): [number, number] {
      // Rotate around Y axis
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const rx = cosA * x - sinA * z;
      const rz = sinA * x + cosA * z;
      // Tilt around X axis
      const tilt  = 0.35;
      const cosT  = Math.cos(tilt);
      const sinT  = Math.sin(tilt);
      const ry2   = cosT * y  - sinT * rz;
      const scale = Math.min(w, h) / 60;
      const cx    = w / 2;
      const cy    = h / 2 + 20;
      return [cx + rx * scale, cy - ry2 * scale];
    }

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.033);
      last = ts;

      const w = canvas.width, h = canvas.height;
      const s = sigmaRef.current;
      const r = rhoRef.current;
      const b = betaRef.current;

      // Advance angle
      angleRef.current += dt * 0.08;
      const angle = angleRef.current;

      ctx.fillStyle = 'rgba(0,0,8,0.18)';
      ctx.fillRect(0, 0, w, h);

      // Integrate each trajectory (multiple steps for detail)
      const stepsPerFrame = 10;
      const subDt = dt / stepsPerFrame;

      for (const traj of trajRef.current) {
        for (let st = 0; st < stepsPerFrame; st++) {
          const [nx, ny, nz] = lorenzStep(traj.x, traj.y, traj.z, s, r, b, subDt);
          traj.x = nx; traj.y = ny; traj.z = nz;

          const idx = (traj.head % TRAIL_LEN) * 3;
          traj.points[idx]     = nx;
          traj.points[idx + 1] = ny;
          traj.points[idx + 2] = nz;
          traj.head++;
          if (traj.count < TRAIL_LEN) traj.count++;
        }

        // Draw trail
        if (traj.count < 2) continue;
        ctx.beginPath();
        const start = traj.head - traj.count;
        for (let i = 0; i < traj.count; i++) {
          const ptr = ((start + i) % TRAIL_LEN) * 3;
          const px = traj.points[ptr];
          const py = traj.points[ptr + 1];
          const pz = traj.points[ptr + 2];
          const [sx, sy] = project(px, py, pz, angle, w, h);
          const alpha = (i / traj.count);
          if (i === 0) ctx.moveTo(sx, sy);
          else {
            // Change stroke color with alpha
            if (i % 40 === 0 || i === traj.count - 1) {
              ctx.strokeStyle = traj.color + Math.floor(alpha * 200).toString(16).padStart(2, '0');
              ctx.lineWidth   = 0.8 + alpha * 0.7;
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(sx, sy);
            } else {
              ctx.lineTo(sx, sy);
            }
          }
        }
        ctx.strokeStyle = traj.color + 'ee';
        ctx.lineWidth   = 1;
        ctx.stroke();

        // Head dot
        const [hx, hy] = project(traj.x, traj.y, traj.z, angle, w, h);
        ctx.beginPath();
        ctx.arc(hx, hy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  function handlePerturb() {
    const traj = trajRef.current[0];
    traj.x += (Math.random() - 0.5) * 0.5;
    traj.y += (Math.random() - 0.5) * 0.5;
    traj.z += (Math.random() - 0.5) * 0.5;
  }

  function handleReset() {
    trajRef.current = Array.from({ length: NUM_TRAJ }, (_, i) => makeTrajectory(i));
  }

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          σ (sigma): {sigma.toFixed(1)}
          <input type="range" min={1} max={20} step={0.5} value={sigma}
            onChange={e => setSigma(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          ρ (rho): {rho.toFixed(1)}
          <input type="range" min={1} max={50} step={0.5} value={rho}
            onChange={e => setRho(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          β (beta): {beta.toFixed(2)}
          <input type="range" min={0.1} max={5} step={0.05} value={beta}
            onChange={e => setBeta(parseFloat(e.target.value))}
            className="w-20 accent-cyan-400" />
        </label>
        <button onClick={handlePerturb}
          className="px-3 py-1 rounded bg-violet-500/20 hover:bg-violet-500/40 text-violet-400 transition-colors">
          Perturb
        </button>
        <button onClick={handleReset}
          className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}

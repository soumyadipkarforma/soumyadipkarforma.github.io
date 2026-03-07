import { useRef, useEffect, useState, useCallback } from 'react';

interface SlitConfig {
  separation: number;
  slitWidth:  number;
  wavelength: number;
  singleSlit: boolean;
}

interface QParticle {
  x: number;
  y: number;
  vy: number;
  alive: boolean;
  color: string;
}

function wavelengthToColor(wl: number): string {
  // 380-700nm → visible spectrum
  const t = (wl - 380) / (700 - 380);
  const hue = (1 - t) * 270;
  return `hsl(${hue}, 100%, 65%)`;
}

function calcProbabilityY(
  y: number, screenX: number, barrierX: number,
  slit1Y: number, slit2Y: number,
  k: number, slitWidth: number, useBothSlits: boolean
): number {
  const r1 = Math.sqrt((screenX - barrierX) ** 2 + (y - slit1Y) ** 2);
  const r2 = Math.sqrt((screenX - barrierX) ** 2 + (y - slit2Y) ** 2);

  // Single-slit diffraction envelope
  function diffraction(dy: number): number {
    const beta = (Math.PI * slitWidth * dy) / (wavelengthNm * (screenX - barrierX));
    if (Math.abs(beta) < 1e-6) return 1;
    return Math.pow(Math.sin(beta) / beta, 2);
  }

  const wavelengthNm = k / (2 * Math.PI) * 550;

  if (!useBothSlits) {
    const dy1 = y - slit1Y;
    return diffraction(dy1);
  }

  const psi1 = Math.cos(k * r1) / Math.sqrt(Math.max(r1, 1));
  const psi2 = Math.cos(k * r2) / Math.sqrt(Math.max(r2, 1));
  const psi  = psi1 + psi2;
  const envelope = diffraction(y - (slit1Y + slit2Y) / 2);
  return psi * psi * envelope;
}

export default function DoubleSlit() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const configRef  = useRef<SlitConfig>({ separation: 80, slitWidth: 12, wavelength: 500, singleSlit: false });
  const particlesRef   = useRef<QParticle[]>([]);
  const screenCountRef = useRef<Float32Array>(new Float32Array(400));
  const screenMaxRef   = useRef(1);
  const timeRef        = useRef(0);

  const [separation, setSeparation] = useState(80);
  const [slitWidth,  setSlitWidth]  = useState(12);
  const [wavelength, setWavelength] = useState(500);
  const [singleSlit, setSingleSlit] = useState(false);

  useEffect(() => {
    configRef.current = { separation, slitWidth, wavelength, singleSlit };
  }, [separation, slitWidth, wavelength, singleSlit]);

  const reset = useCallback(() => {
    particlesRef.current = [];
    screenCountRef.current = new Float32Array(400);
    screenMaxRef.current = 1;
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

    const ctx = canvas.getContext('2d')!;
    let last = performance.now();
    let raf  = 0;
    let spawnTimer = 0;

    function spawnParticle(w: number, h: number) {
      const cfg = configRef.current;
      const barrierX = w * 0.42;
      const screenX  = w * 0.85;
      const cy = h / 2;
      const k  = (2 * Math.PI) / (cfg.wavelength * 0.18);

      const slit1Y = cy - cfg.separation / 2;
      const slit2Y = cy + cfg.separation / 2;

      // Build probability distribution on screen
      const bins = screenCountRef.current.length;
      const prob = new Float64Array(bins);
      let total = 0;
      for (let b = 0; b < bins; b++) {
        const y = (b / bins) * h;
        prob[b] = Math.max(0, calcProbabilityY(y, screenX, barrierX, slit1Y, slit2Y, k, cfg.slitWidth, !cfg.singleSlit));
        total += prob[b];
      }

      // Sample from distribution
      let rand = Math.random() * total;
      let targetBin = bins - 1;
      for (let b = 0; b < bins; b++) {
        rand -= prob[b];
        if (rand <= 0) { targetBin = b; break; }
      }

      const targetY = (targetBin / bins) * h + (Math.random() - 0.5) * (h / bins);

      // Choose which slit it passes through
      const useSlit1 = cfg.singleSlit || Math.random() < 0.5;
      const slitY = useSlit1 ? slit1Y : slit2Y;

      particlesRef.current.push({
        x: w * 0.05,
        y: cy + (Math.random() - 0.5) * 4,
        vy: (targetY - slitY) / (barrierX - w * 0.05) * 120,
        alive: true,
        color: wavelengthToColor(cfg.wavelength),
      });
    }

    function loop(ts: number) {
      if (!canvas) return;
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      timeRef.current += dt;
      spawnTimer += dt;

      const w = canvas.width, h = canvas.height;
      const cfg = configRef.current;
      const barrierX = w * 0.42;
      const screenX  = w * 0.85;
      const cy = h / 2;
      const slit1Y = cy - cfg.separation / 2;
      const slit2Y = cy + cfg.separation / 2;
      const particleSpeed = 120;

      // Spawn ~30 particles/second
      while (spawnTimer > 1 / 30) {
        spawnTimer -= 1 / 30;
        spawnParticle(w, h);
      }

      ctx.fillStyle = 'rgba(0,0,8,0.18)';
      ctx.fillRect(0, 0, w, h);

      // === Source beam ===
      const beamGrad = ctx.createLinearGradient(0, 0, barrierX, 0);
      beamGrad.addColorStop(0,   wavelengthToColor(cfg.wavelength) + '30');
      beamGrad.addColorStop(1,   wavelengthToColor(cfg.wavelength) + '08');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, cy - 2, barrierX, 4);

      // === Barrier ===
      ctx.fillStyle = '#334466';
      ctx.fillRect(barrierX - 4, 0, 8, h);

      // Slits (erase)
      ctx.clearRect(barrierX - 4, slit1Y - cfg.slitWidth / 2, 8, cfg.slitWidth);
      if (!cfg.singleSlit) ctx.clearRect(barrierX - 4, slit2Y - cfg.slitWidth / 2, 8, cfg.slitWidth);

      // Redraw barrier sides
      ctx.fillStyle = '#334466';
      ctx.fillRect(barrierX - 4, 0, 8, slit1Y - cfg.slitWidth / 2);
      ctx.fillRect(barrierX - 4, slit1Y + cfg.slitWidth / 2, 8,
        cfg.singleSlit ? h : (slit2Y - cfg.slitWidth / 2 - (slit1Y + cfg.slitWidth / 2)));
      if (!cfg.singleSlit) {
        ctx.fillRect(barrierX - 4, slit2Y + cfg.slitWidth / 2, 8, h - slit2Y - cfg.slitWidth / 2);
      }

      // === Screen ===
      ctx.fillStyle = '#111828';
      ctx.fillRect(screenX - 3, 0, 6, h);

      // Draw accumulated pattern on screen
      const bins  = screenCountRef.current.length;
      const maxV  = screenMaxRef.current;
      for (let b = 0; b < bins; b++) {
        const v = screenCountRef.current[b] / maxV;
        if (v < 0.001) continue;
        const y0 = (b / bins) * h;
        const y1 = ((b + 1) / bins) * h;
        const alpha = Math.min(v * 1.5, 1);
        ctx.fillStyle = wavelengthToColor(cfg.wavelength).replace('65%)', `${Math.round(20 + alpha * 80)}%)`);
        ctx.fillRect(screenX + 3, y0, 12, Math.max(y1 - y0, 1));
      }

      // === Particles ===
      for (const p of particlesRef.current) {
        if (!p.alive) continue;
        p.x += particleSpeed * dt;

        // Diffract at barrier
        if (p.x >= barrierX - 2 && p.x < barrierX + 4) {
          const inSlit1 = Math.abs(p.y - slit1Y) < cfg.slitWidth / 2;
          const inSlit2 = !cfg.singleSlit && Math.abs(p.y - slit2Y) < cfg.slitWidth / 2;
          if (!inSlit1 && !inSlit2) { p.alive = false; continue; }
        }

        // After barrier: allow y drift
        if (p.x > barrierX) p.y += p.vy * dt;

        // Hit screen
        if (p.x >= screenX) {
          const bin = Math.floor((p.y / h) * bins);
          if (bin >= 0 && bin < bins) {
            screenCountRef.current[bin]++;
            if (screenCountRef.current[bin] > screenMaxRef.current) {
              screenMaxRef.current = screenCountRef.current[bin];
            }
          }
          p.alive = false;
          continue;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // Prune dead
      particlesRef.current = particlesRef.current.filter(p => p.alive);

      // Labels
      ctx.fillStyle = 'rgba(150,200,255,0.6)';
      ctx.font = '11px monospace';
      ctx.fillText('Source', 10, h - 10);
      ctx.fillText('Barrier', barrierX - 20, 14);
      ctx.fillText('Screen', screenX + 8, 14);

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#000008', minHeight: 400 }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        <label className="flex items-center gap-2">
          Slit Separation: {separation}px
          <input type="range" min={20} max={200} step={2} value={separation}
            onChange={e => setSeparation(parseInt(e.target.value))}
            className="w-24 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          Slit Width: {slitWidth}px
          <input type="range" min={4} max={40} step={1} value={slitWidth}
            onChange={e => setSlitWidth(parseInt(e.target.value))}
            className="w-24 accent-cyan-400" />
        </label>
        <label className="flex items-center gap-2">
          Wavelength: {wavelength}nm
          <input type="range" min={380} max={700} step={5} value={wavelength}
            onChange={e => setWavelength(parseInt(e.target.value))}
            className="w-24 accent-cyan-400"
            style={{ accentColor: wavelengthToColor(wavelength) }}
          />
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={singleSlit}
            onChange={e => { setSingleSlit(e.target.checked); reset(); }}
            className="accent-cyan-400" />
          Single slit
        </label>
        <button onClick={reset}
          className="px-3 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}

import { useRef, useEffect, useState, useCallback } from 'react';

type Preset = 'coral' | 'spots' | 'stripes' | 'worms';

interface GrayScottParams {
  Du: number; Dv: number; F: number; K: number;
}

const PRESETS: Record<Preset, GrayScottParams> = {
  coral:   { Du: 0.16, Dv: 0.08, F: 0.0545, K: 0.062 },
  spots:   { Du: 0.16, Dv: 0.08, F: 0.035,  K: 0.065 },
  stripes: { Du: 0.16, Dv: 0.08, F: 0.04,   K: 0.059 },
  worms:   { Du: 0.16, Dv: 0.08, F: 0.078,  K: 0.061 },
};

const GRID = 200;

function initGrids(preset: Preset) {
  const U = new Float32Array(GRID * GRID);
  const V = new Float32Array(GRID * GRID);
  U.fill(1);
  V.fill(0);

  // Seed some V in the center
  const cx = GRID / 2, cy = GRID / 2;
  const seedR = preset === 'coral' ? 15 : preset === 'worms' ? 8 : 12;
  for (let y = -seedR; y <= seedR; y++) {
    for (let x = -seedR; x <= seedR; x++) {
      if (x * x + y * y <= seedR * seedR) {
        const idx = (cy + y) * GRID + (cx + x);
        U[idx] = 0.5 + (Math.random() - 0.5) * 0.1;
        V[idx] = 0.25 + (Math.random() - 0.5) * 0.1;
      }
    }
  }
  return { U, V };
}

function laplacian(grid: Float32Array, x: number, y: number): number {
  const left  = x > 0         ? x - 1 : GRID - 1;
  const right = x < GRID - 1  ? x + 1 : 0;
  const up    = y > 0         ? y - 1 : GRID - 1;
  const down  = y < GRID - 1  ? y + 1 : 0;
  return (
    grid[y * GRID + left]  +
    grid[y * GRID + right] +
    grid[up   * GRID + x]  +
    grid[down * GRID + x]  -
    4 * grid[y * GRID + x]
  );
}

function grayScottStep(
  U: Float32Array, V: Float32Array,
  nU: Float32Array, nV: Float32Array,
  p: GrayScottParams, dt: number
) {
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i  = y * GRID + x;
      const u  = U[i], v = V[i];
      const lu = laplacian(U, x, y);
      const lv = laplacian(V, x, y);
      const uvv = u * v * v;
      nU[i] = u + (p.Du * lu - uvv + p.F * (1 - u)) * dt;
      nV[i] = v + (p.Dv * lv + uvv - (p.F + p.K) * v) * dt;
      if (nU[i] < 0) nU[i] = 0;
      if (nU[i] > 1) nU[i] = 1;
      if (nV[i] < 0) nV[i] = 0;
      if (nV[i] > 1) nV[i] = 1;
    }
  }
}

export default function ReactionDiffusion() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const URef        = useRef<Float32Array>(new Float32Array(GRID * GRID));
  const VRef        = useRef<Float32Array>(new Float32Array(GRID * GRID));
  const nURef       = useRef<Float32Array>(new Float32Array(GRID * GRID));
  const nVRef       = useRef<Float32Array>(new Float32Array(GRID * GRID));
  const presetRef   = useRef<Preset>('coral');
  const imageRef    = useRef<ImageData | null>(null);
  const [activePreset, setActivePreset] = useState<Preset>('coral');

  const applyPreset = useCallback((p: Preset) => {
    presetRef.current = p;
    const grids = initGrids(p);
    URef.current  = grids.U;
    VRef.current  = grids.V;
    nURef.current = new Float32Array(GRID * GRID);
    nVRef.current = new Float32Array(GRID * GRID);
    setActivePreset(p);
  }, []);

  useEffect(() => {
    applyPreset('coral');
  }, [applyPreset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      imageRef.current = null;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    function loop() {
      if (!canvas) return;
      const w = canvas.width, h = canvas.height;
      const p = PRESETS[presetRef.current];
      const dt = 1.0;

      // 8 steps per frame
      for (let step = 0; step < 8; step++) {
        grayScottStep(URef.current, VRef.current, nURef.current, nVRef.current, p, dt);
        // Swap
        const tmpU = URef.current;
        URef.current  = nURef.current;
        nURef.current = tmpU;
        const tmpV = VRef.current;
        VRef.current  = nVRef.current;
        nVRef.current = tmpV;
      }

      // Render grid to ImageData
      if (!imageRef.current || imageRef.current.width !== GRID || imageRef.current.height !== GRID) {
        imageRef.current = new ImageData(GRID, GRID);
      }
      const data = imageRef.current.data;
      const V = VRef.current;
      for (let i = 0; i < GRID * GRID; i++) {
        const v = Math.min(1, V[i] * 2.5);
        // Color: dark purple → cyan → white
        let r: number, g: number, b: number;
        if (v < 0.33) {
          const t = v / 0.33;
          r = Math.round(20  + t * 80);
          g = Math.round(5   + t * 30);
          b = Math.round(40  + t * 140);
        } else if (v < 0.66) {
          const t = (v - 0.33) / 0.33;
          r = Math.round(100 + t * 50);
          g = Math.round(35  + t * 160);
          b = Math.round(180 + t * 75);
        } else {
          const t = (v - 0.66) / 0.34;
          r = Math.round(150 + t * 105);
          g = Math.round(195 + t * 60);
          b = Math.round(255);
        }
        const off = i * 4;
        data[off]     = r;
        data[off + 1] = g;
        data[off + 2] = b;
        data[off + 3] = 255;
      }

      // Scale up to canvas
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width  = GRID;
      tmpCanvas.height = GRID;
      const tmpCtx = tmpCanvas.getContext('2d')!;
      tmpCtx.putImageData(imageRef.current, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmpCanvas, 0, 0, w, h);

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    function onMouseMove(e: MouseEvent) {
      if (e.buttons === 0) return;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const gx = Math.floor(((e.clientX - rect.left) / canvas.width)  * GRID);
      const gy = Math.floor(((e.clientY - rect.top)  / canvas.height) * GRID);
      const radius = 5;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const nx = gx + dx, ny = gy + dy;
          if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
            const i = ny * GRID + nx;
            VRef.current[i] = 0.5;
            URef.current[i] = 0.5;
          }
        }
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onMouseMove as EventListener);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('click', onMouseMove as EventListener);
    };
  }, []);

  const presets: Preset[] = ['coral', 'spots', 'stripes', 'worms'];

  return (
    <div className="flex flex-col h-full">
      <canvas
        ref={canvasRef}
        style={{ flex: 1, display: 'block', width: '100%', background: '#050510', minHeight: 400, cursor: 'crosshair' }}
      />
      <div className="p-3 flex flex-wrap gap-4 items-center bg-black/40 text-xs text-gray-400">
        {presets.map(p => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`px-3 py-1 rounded capitalize transition-colors ${
              activePreset === p
                ? 'bg-cyan-500/40 text-cyan-300'
                : 'bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-500'
            }`}
          >
            {p}
          </button>
        ))}
        <span className="text-gray-600 italic">Click/drag on canvas to disturb the pattern</span>
      </div>
    </div>
  );
}

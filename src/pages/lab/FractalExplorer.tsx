import { useRef, useEffect, useCallback, useState } from 'react';

const MAX_ITER = 128;

function mandelbrot(cx: number, cy: number): number {
  let x = 0, y = 0, i = 0;
  while (x * x + y * y <= 4 && i < MAX_ITER) {
    const xt = x * x - y * y + cx;
    y = 2 * x * y + cy; x = xt; i++;
  }
  return i;
}

const PALETTES: Record<string, (t: number) => [number, number, number]> = {
  'Cyber':    t => [Math.floor(9 * (1-t) * t * t * t * 255), Math.floor(15 * (1-t) * (1-t) * t * t * 255), Math.floor(8.5 * (1-t) * (1-t) * (1-t) * t * 255)],
  'Neon':     t => [Math.floor(Math.sin(t * Math.PI * 3) * 127 + 128), Math.floor(Math.sin(t * Math.PI * 3 + 2) * 60 + 64), Math.floor(Math.sin(t * Math.PI * 3 + 4) * 127 + 128)],
  'Inferno':  t => [Math.floor(255 * Math.min(1, t * 3)), Math.floor(255 * Math.min(1, Math.max(0, t * 3 - 1))), Math.floor(255 * Math.max(0, t * 3 - 2))],
  'Ocean':    t => [0, Math.floor(t * 180 + 20), Math.floor(t * 200 + 55)],
};

export default function FractalExplorer() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const viewRef     = useRef({ xMin: -2.5, xMax: 1.0, yMin: -1.2, yMax: 1.2 });
  const [palette, setPalette]     = useState('Cyber');
  const [rendering, setRendering] = useState(false);
  const [zoom,  setZoom]          = useState(1);
  const workerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paletteRef = useRef(palette);
  useEffect(() => { paletteRef.current = palette; }, [palette]);

  const render = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const { xMin, xMax, yMin, yMax } = viewRef.current;
    const colFn = PALETTES[paletteRef.current] ?? PALETTES['Cyber'];
    setRendering(true);

    if (workerRef.current) clearTimeout(workerRef.current);

    // Render in chunks to keep UI responsive
    const imgData = ctx.createImageData(W, H);
    const data = imgData.data;
    const CHUNK = 32;
    let row = 0;

    function renderChunk() {
      const end = Math.min(row + CHUNK, H);
      for (let py = row; py < end; py++) {
        const cy = yMin + (py / H) * (yMax - yMin);
        for (let px = 0; px < W; px++) {
          const cx = xMin + (px / W) * (xMax - xMin);
          const iter = mandelbrot(cx, cy);
          const idx  = (py * W + px) * 4;
          if (iter === MAX_ITER) {
            data[idx] = data[idx+1] = data[idx+2] = 0; data[idx+3] = 255;
          } else {
            const t = iter / MAX_ITER;
            const [r, g, b] = colFn(t);
            data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = 255;
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
      row = end;
      if (row < H) {
        workerRef.current = setTimeout(renderChunk, 0);
      } else {
        setRendering(false);
      }
    }
    renderChunk();
  }, []);

  const handleZoom = useCallback((factor: number, px?: number, py?: number) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const v = viewRef.current;
    const W = canvas.width, H = canvas.height;
    const cx = px !== undefined ? v.xMin + (px / W) * (v.xMax - v.xMin) : (v.xMin + v.xMax) / 2;
    const cy = py !== undefined ? v.yMin + (py / H) * (v.yMax - v.yMin) : (v.yMin + v.yMax) / 2;
    const hw = (v.xMax - v.xMin) / 2 * factor;
    const hh = (v.yMax - v.yMin) / 2 * factor;
    viewRef.current = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    setZoom(z => z * (factor < 1 ? 1 / factor : factor));
    render();
  }, [render]);

  const reset = useCallback(() => {
    viewRef.current = { xMin: -2.5, xMax: 1.0, yMin: -1.2, yMax: 1.2 };
    setZoom(1);
    render();
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    render();

    function onWheel(e: WheelEvent) {
      const canvas = canvasRef.current; if (!canvas) return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      handleZoom(e.deltaY > 0 ? 1.3 : 0.7, e.clientX - r.left, e.clientY - r.top);
    }
    canvas.addEventListener('wheel', onWheel, { passive: false });

    let dragStart: { x: number; y: number; vxMin: number; vxMax: number; vyMin: number; vyMax: number } | null = null;
    function onDown(e: PointerEvent) {
      const v = viewRef.current;
      dragStart = { x: e.clientX, y: e.clientY, vxMin: v.xMin, vxMax: v.xMax, vyMin: v.yMin, vyMax: v.yMax };
    }
    function onMv(e: PointerEvent) {
      if (!dragStart) return;
      const canvas = canvasRef.current; if (!canvas) return;
      const W = canvas.width, H = canvas.height;
      const dx = (e.clientX - dragStart.x) / W * (dragStart.vxMax - dragStart.vxMin);
      const dy = (e.clientY - dragStart.y) / H * (dragStart.vyMax - dragStart.vyMin);
      viewRef.current = { xMin: dragStart.vxMin - dx, xMax: dragStart.vxMax - dx, yMin: dragStart.vyMin - dy, yMax: dragStart.vyMax - dy };
    }
    function onUp() { if (dragStart) render(); dragStart = null; }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMv);
    canvas.addEventListener('pointerup', onUp);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMv);
      canvas.removeEventListener('pointerup', onUp);
      if (workerRef.current) clearTimeout(workerRef.current);
    };
  }, [render, handleZoom]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {Object.keys(PALETTES).map(p => (
            <button key={p} onClick={() => { setPalette(p); setTimeout(render, 0); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${palette === p ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
              {p}
            </button>
          ))}
        </div>
        <button onClick={() => handleZoom(0.5)}
          className="px-3 py-1 rounded-lg text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors">
          🔍 Zoom In
        </button>
        <button onClick={() => handleZoom(2)}
          className="px-3 py-1 rounded-lg text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors">
          🔎 Zoom Out
        </button>
        <button onClick={reset}
          className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
          Reset
        </button>
        {rendering && <span className="text-xs text-cyan-400 animate-pulse">Rendering…</span>}
        <span className="text-xs text-gray-600">Zoom ×{zoom.toFixed(1)}</span>
      </div>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-xl cursor-crosshair"
        style={{ background: '#000', minHeight: 240 }} />
      <p className="text-xs text-gray-600">Scroll to zoom · drag to pan · click colour palette to recolour</p>
    </div>
  );
}

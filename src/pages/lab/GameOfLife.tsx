import { useRef, useEffect, useCallback, useState } from 'react';

const CELL_SIZE = 10;

function makeGrid(cols: number, rows: number, fill = false): Uint8Array {
  const g = new Uint8Array(cols * rows);
  if (fill) for (let i = 0; i < g.length; i++) g[i] = Math.random() < 0.3 ? 1 : 0;
  return g;
}

function step(grid: Uint8Array, cols: number, rows: number): Uint8Array {
  const next = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + cols) % cols;
        const ny = (y + dy + rows) % rows;
        n += grid[ny * cols + nx];
      }
      const cur = grid[y * cols + x];
      next[y * cols + x] = cur ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
    }
  }
  return next;
}

// Classic patterns
const PATTERNS: Record<string, number[][]> = {
  'Glider':      [[0,1],[1,2],[2,0],[2,1],[2,2]],
  'Pulsar':      [[2,4],[2,5],[2,6],[2,10],[2,11],[2,12],[4,2],[4,7],[4,9],[4,14],[5,2],[5,7],[5,9],[5,14],[6,2],[6,7],[6,9],[6,14],[7,4],[7,5],[7,6],[7,10],[7,11],[7,12],[9,4],[9,5],[9,6],[9,10],[9,11],[9,12],[10,2],[10,7],[10,9],[10,14],[11,2],[11,7],[11,9],[11,14],[12,2],[12,7],[12,9],[12,14],[14,4],[14,5],[14,6],[14,10],[14,11],[14,12]],
  'R-pentomino': [[0,1],[0,2],[1,0],[1,1],[2,1]],
  'LWSS':        [[0,1],[0,4],[1,0],[2,0],[3,0],[3,4],[4,0],[4,1],[4,2],[4,3]],
};

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef   = useRef<Uint8Array>(new Uint8Array(0));
  const colsRef   = useRef(0); const rowsRef = useRef(0);
  const rafRef    = useRef(0);
  const [playing,   setPlaying]   = useState(false);
  const [drawing,   setDrawing]   = useState(false);
  const [gen,       setGen]       = useState(0);
  const [speed,     setSpeed]     = useState(8);
  const speedRef    = useRef(speed);
  const genRef      = useRef(0);
  const lastStepRef = useRef(0);
  const drawRef     = useRef(drawing);
  const playRef     = useRef(playing);
  useEffect(() => { speedRef.current = speed; },   [speed]);
  useEffect(() => { drawRef.current  = drawing; },  [drawing]);
  useEffect(() => { playRef.current  = playing; },  [playing]);

  const getCell = useCallback((e: PointerEvent): [number, number] | null => {
    const c = canvasRef.current; if (!c) return null;
    const r = c.getBoundingClientRect();
    return [Math.floor((e.clientX - r.left) / CELL_SIZE), Math.floor((e.clientY - r.top) / CELL_SIZE)];
  }, []);

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const cols = colsRef.current, rows = rowsRef.current;
    const W = c.width, H = c.height;
    ctx.fillStyle = 'rgba(5,5,20,1)'; ctx.fillRect(0, 0, W, H);
    const g = gridRef.current;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!g[y * cols + x]) continue;
        const grd = ctx.createRadialGradient(x*CELL_SIZE+CELL_SIZE/2, y*CELL_SIZE+CELL_SIZE/2, 0, x*CELL_SIZE+CELL_SIZE/2, y*CELL_SIZE+CELL_SIZE/2, CELL_SIZE);
        grd.addColorStop(0, '#00d4ff'); grd.addColorStop(1, '#0066aa');
        ctx.fillStyle = grd;
        ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }, []);

  const init = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    colsRef.current = Math.floor(c.width / CELL_SIZE);
    rowsRef.current = Math.floor(c.height / CELL_SIZE);
    gridRef.current = makeGrid(colsRef.current, rowsRef.current, true);
    genRef.current = 0; setGen(0);
    draw();
  }, [draw]);

  const placePattern = useCallback((name: string) => {
    const cols = colsRef.current, rows = rowsRef.current;
    if (!cols) return;
    const pat = PATTERNS[name];
    const ox = Math.floor(cols / 2) - 8, oy = Math.floor(rows / 2) - 8;
    const g = new Uint8Array(gridRef.current);
    pat.forEach(([y, x]) => { const nx = ox+x, ny = oy+y; if (nx>=0&&nx<cols&&ny>=0&&ny<rows) g[ny*cols+nx]=1; });
    gridRef.current = g; genRef.current = 0; setGen(0); draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight; init(); });
    ro.observe(canvas);
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    init();

    let isDown = false;
    function onDown(e: PointerEvent) {
      if (!drawRef.current) return;
      isDown = true; toggle(e);
      canvasRef.current!.setPointerCapture(e.pointerId);
    }
    function toggle(e: PointerEvent) {
      if (!isDown) return;
      const cell = getCell(e); if (!cell) return;
      const [x, y] = cell;
      const cols = colsRef.current, rows = rowsRef.current;
      if (x < 0 || x >= cols || y < 0 || y >= rows) return;
      const g = new Uint8Array(gridRef.current);
      g[y * cols + x] = 1;
      gridRef.current = g; draw();
    }
    function onUp() { isDown = false; }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', toggle);
    canvas.addEventListener('pointerup', onUp);

    function loop(ts: number) {
      if (playRef.current && ts - lastStepRef.current > 1000 / speedRef.current) {
        gridRef.current = step(gridRef.current, colsRef.current, rowsRef.current);
        genRef.current++; setGen(g => g + 1);
        lastStepRef.current = ts;
        draw();
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', toggle); canvas.removeEventListener('pointerup', onUp); };
  }, [init, draw, getCell]);

  const clear = () => {
    if (!colsRef.current) return;
    gridRef.current = new Uint8Array(colsRef.current * rowsRef.current);
    genRef.current = 0; setGen(0); draw();
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={() => setPlaying(p => !p)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors">
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={() => { gridRef.current = step(gridRef.current, colsRef.current, rowsRef.current); genRef.current++; setGen(g => g+1); draw(); }}
          disabled={playing}
          className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-40 transition-colors">
          Step →
        </button>
        <button onClick={init}
          className="px-3 py-1 rounded-lg text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors">
          🎲 Random
        </button>
        <button onClick={clear}
          className="px-3 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors">
          Clear
        </button>
        <button onClick={() => setDrawing(d => !d)}
          className={`px-3 py-1 rounded-lg text-xs border transition-colors ${drawing ? 'bg-pink-500/20 border-pink-500/30 text-pink-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
          ✏️ Draw
        </button>
        {Object.keys(PATTERNS).map(n => (
          <button key={n} onClick={() => placePattern(n)}
            className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-colors">
            {n}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
          Speed
          <input type="range" min="1" max="30" value={speed} onChange={e => setSpeed(+e.target.value)} className="w-20 accent-cyan-400" />
          <span className="text-cyan-400 w-4">{speed}</span>
        </label>
        <span className="text-xs text-gray-600">Gen {gen}</span>
      </div>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-xl"
        style={{ background: 'rgba(5,5,20,0.9)', cursor: drawing ? 'crosshair' : 'default', minHeight: 240 }} />
      <p className="text-xs text-gray-600">Conway's Game of Life · B3/S23 rules · cells wrap around edges · enable Draw to paint live cells</p>
    </div>
  );
}

import { useRef, useEffect, useCallback, useState } from 'react';

type SortFn = (arr: number[], signal: () => boolean) => AsyncGenerator<{ arr: number[]; comparing: number[]; swapped: number[] }>;

async function* bubbleSort(arr: number[], signal: () => boolean) {
  const a = [...arr]; const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (signal()) return;
      if (a[j] > a[j+1]) { [a[j], a[j+1]] = [a[j+1], a[j]]; yield { arr: [...a], comparing: [j, j+1], swapped: [j, j+1] }; }
      else yield { arr: [...a], comparing: [j, j+1], swapped: [] };
    }
  }
  yield { arr: [...a], comparing: [], swapped: [] };
}

async function* selectionSort(arr: number[], signal: () => boolean) {
  const a = [...arr]; const n = a.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i+1; j < n; j++) {
      if (signal()) return;
      if (a[j] < a[minIdx]) minIdx = j;
      yield { arr: [...a], comparing: [j, minIdx], swapped: [] };
    }
    if (minIdx !== i) { [a[i], a[minIdx]] = [a[minIdx], a[i]]; yield { arr: [...a], comparing: [], swapped: [i, minIdx] }; }
  }
  yield { arr: [...a], comparing: [], swapped: [] };
}

async function* insertionSort(arr: number[], signal: () => boolean) {
  const a = [...arr]; const n = a.length;
  for (let i = 1; i < n; i++) {
    let j = i;
    while (j > 0 && a[j-1] > a[j]) {
      if (signal()) return;
      [a[j], a[j-1]] = [a[j-1], a[j]];
      yield { arr: [...a], comparing: [j, j-1], swapped: [j, j-1] };
      j--;
    }
  }
  yield { arr: [...a], comparing: [], swapped: [] };
}

async function* quickSort(arr: number[], signal: () => boolean) {
  const a = [...arr];
  async function* qs(lo: number, hi: number): AsyncGenerator<{ arr: number[]; comparing: number[]; swapped: number[] }> {
    if (lo >= hi || signal()) return;
    const pivot = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) {
      if (signal()) return;
      yield { arr: [...a], comparing: [j, hi], swapped: [] };
      if (a[j] <= pivot) { [a[i], a[j]] = [a[j], a[i]]; yield { arr: [...a], comparing: [], swapped: [i, j] }; i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]]; yield { arr: [...a], comparing: [], swapped: [i, hi] };
    yield* qs(lo, i-1); yield* qs(i+1, hi);
  }
  yield* qs(0, a.length-1);
  yield { arr: [...a], comparing: [], swapped: [] };
}

const ALGORITHMS: Record<string, SortFn> = { Bubble: bubbleSort, Selection: selectionSort, Insertion: insertionSort, Quick: quickSort };

function makeSortedArray(n: number) { return Array.from({ length: n }, (_, i) => Math.floor((i + 1) / n * 100)); }
function shuffle(a: number[]) { const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r; }

export default function SortingVisualizer() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<{ arr: number[]; comparing: number[]; swapped: number[] }>({ arr: [], comparing: [], swapped: [] });
  const stopRef    = useRef(false);
  const [algo,     setAlgo]     = useState('Bubble');
  const [running,  setRunning]  = useState(false);
  const [count,    setCount]    = useState(60);
  const [speed,    setSpeed]    = useState(30);
  const speedRef   = useRef(speed);
  const countRef   = useRef(count);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { countRef.current = count; }, [count]);

  const renderFrame = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const { arr, comparing, swapped } = stateRef.current;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    const barW = W / arr.length;
    arr.forEach((v, i) => {
      const barH = (v / 100) * (H - 20);
      const isComp = comparing.includes(i);
      const isSw   = swapped.includes(i);
      let color = '#1e3a5f';
      if (isComp) color = '#f59e0b';
      if (isSw)   color = '#f472b6';
      ctx.fillStyle = color;
      ctx.shadowColor = isSw ? '#f472b6' : isComp ? '#f59e0b' : 'transparent';
      ctx.shadowBlur  = isComp || isSw ? 8 : 0;
      ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH);
      ctx.shadowBlur = 0;
    });
  }, []);

  const reset = useCallback(() => {
    stopRef.current = true;
    const arr = shuffle(makeSortedArray(countRef.current));
    stateRef.current = { arr, comparing: [], swapped: [] };
    setRunning(false);
    setTimeout(renderFrame, 50);
  }, [renderFrame]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(() => { c.width=c.offsetWidth; c.height=c.offsetHeight; renderFrame(); });
    ro.observe(c);
    c.width=c.offsetWidth; c.height=c.offsetHeight;
    reset();
    return () => ro.disconnect();
  }, [reset, renderFrame]);

  const run = useCallback(async () => {
    stopRef.current = false;
    setRunning(true);
    const gen = ALGORITHMS[algo](stateRef.current.arr, () => stopRef.current);
    for await (const frame of gen) {
      if (stopRef.current) break;
      stateRef.current = frame;
      renderFrame();
      const delay = Math.max(1, 200 / speedRef.current);
      await new Promise(r => setTimeout(r, delay));
    }
    setRunning(false);
  }, [algo, renderFrame]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1">
          {Object.keys(ALGORITHMS).map(a => (
            <button key={a} onClick={() => { setAlgo(a); }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${algo===a ? 'bg-cyan-500/30 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
              {a}
            </button>
          ))}
        </div>
        {!running
          ? <button onClick={run} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 transition-colors">▶ Sort</button>
          : <button onClick={() => { stopRef.current = true; setRunning(false); }} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors">⏹ Stop</button>
        }
        <button onClick={reset} disabled={running} className="px-3 py-1 rounded-lg text-xs bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 disabled:opacity-40 transition-colors">
          🔀 Shuffle
        </button>
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          Bars
          <input type="range" min="10" max="120" value={count} disabled={running}
            onChange={e => { setCount(+e.target.value); reset(); }} className="w-16 accent-cyan-400" />
          <span className="text-cyan-400 w-6">{count}</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-gray-500">
          Speed
          <input type="range" min="1" max="100" value={speed}
            onChange={e => setSpeed(+e.target.value)} className="w-16 accent-violet-400" />
          <span className="text-violet-400 w-4">{speed}</span>
        </label>
      </div>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-xl"
        style={{ background: 'rgba(5,5,20,0.8)', minHeight: 200 }} />
      <p className="text-xs text-gray-600">
        <span className="text-yellow-400">■</span> Comparing &nbsp;
        <span className="text-pink-400">■</span> Swapping &nbsp;
        <span className="text-blue-700">■</span> Unsorted
      </p>
    </div>
  );
}

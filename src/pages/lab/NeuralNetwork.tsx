import { useRef, useEffect, useCallback, useState } from 'react';

interface Neuron { x: number; y: number; activation: number; bias: number }
interface Signal { fromLayer: number; fromIdx: number; toLayer: number; toIdx: number; t: number; value: number }

const LAYERS = [4, 6, 6, 3];
const COLORS = { active: '#00d4ff', inactive: '#1e293b', signal: '#f472b6', weight_pos: '#22c55e', weight_neg: '#ef4444' };

function buildNetwork(w: number, h: number): Neuron[][] {
  return LAYERS.map((count, li) => {
    const x = (w / (LAYERS.length + 1)) * (li + 1);
    return Array.from({ length: count }, (_, ni) => ({
      x,
      y: (h / (count + 1)) * (ni + 1),
      activation: Math.random() * 0.4,
      bias: (Math.random() - 0.5) * 0.5,
    }));
  });
}

function buildWeights(): number[][][] {
  return LAYERS.slice(0, -1).map((fromCount, li) =>
    Array.from({ length: fromCount }, () =>
      Array.from({ length: LAYERS[li + 1] }, () => (Math.random() - 0.5) * 2)
    )
  );
}

export default function NeuralNetworkViz() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<{ neurons: Neuron[][]; weights: number[][][]; signals: Signal[]; raf: number }>({
    neurons: [], weights: [], signals: [], raf: 0,
  });
  const [firing, setFiring] = useState(false);
  const [info, setInfo]     = useState('Click "Fire" to propagate a signal through the network');

  const init = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const { width: w, height: h } = c;
    stateRef.current.neurons = buildNetwork(w, h);
    stateRef.current.weights = buildWeights();
    stateRef.current.signals = [];
  }, []);

  const fire = useCallback(() => {
    if (firing) return;
    setFiring(true);
    setInfo('Signal propagating… watch activations travel layer by layer');
    const s = stateRef.current;
    // Randomise input activations
    s.neurons[0].forEach(n => { n.activation = Math.random() * 0.6 + 0.4; });
    // Forward pass: schedule signals layer by layer
    s.signals = [];
    LAYERS.slice(0, -1).forEach((_, li) => {
      s.neurons[li].forEach((from, fi) => {
        s.neurons[li + 1].forEach((_, ti) => {
          s.signals.push({ fromLayer: li, fromIdx: fi, toLayer: li + 1, toIdx: ti, t: 0, value: s.weights[li][fi][ti] });
        });
      });
    });
    setTimeout(() => {
      setFiring(false);
      setInfo('Done! Each colour shows weight sign: green = positive, red = negative');
    }, 2200);
  }, [firing]);

  const randomise = useCallback(() => {
    stateRef.current.weights = buildWeights();
    setInfo('Weights randomised — try firing again');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    init();

    const ctx = canvas.getContext('2d')!;
    let last = 0;

    function draw(ts: number) {
      const dt = Math.min((ts - last) / 1000, 0.05); last = ts;
      const { neurons, weights, signals } = stateRef.current;
      if (!neurons.length) { stateRef.current.raf = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw weight lines
      neurons.slice(0, -1).forEach((layer, li) => {
        layer.forEach((from, fi) => {
          neurons[li + 1].forEach((to, ti) => {
            const w = weights[li][fi][ti];
            const alpha = Math.min(Math.abs(w) * 0.5, 0.35);
            ctx.strokeStyle = w > 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`;
            ctx.lineWidth = Math.abs(w) * 1.2;
            ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
          });
        });
      });

      // Advance and draw signals
      signals.forEach(sig => {
        sig.t = Math.min(sig.t + dt * 0.9, 1);
        const from = neurons[sig.fromLayer][sig.fromIdx];
        const to   = neurons[sig.toLayer][sig.toIdx];
        // ease in-out
        const ease = sig.t < 0.5 ? 2 * sig.t * sig.t : -1 + (4 - 2 * sig.t) * sig.t;
        const px = from.x + (to.x - from.x) * ease;
        const py = from.y + (to.y - from.y) * ease;
        const alpha = Math.sin(sig.t * Math.PI);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244,114,182,${alpha})`;
        ctx.shadowColor = COLORS.signal; ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        // When signal arrives, update activation
        if (sig.t >= 1) {
          const n = neurons[sig.toLayer][sig.toIdx];
          n.activation = Math.min(1, Math.max(0, n.activation + sig.value * 0.15 + n.bias));
        }
      });
      // Remove finished signals
      stateRef.current.signals = signals.filter(s => s.t < 1);

      // Draw neurons
      neurons.forEach(layer => {
        layer.forEach(n => {
          // glow
          const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 24);
          grd.addColorStop(0, `rgba(0,212,255,${n.activation * 0.4})`);
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, 24, 0, Math.PI * 2); ctx.fill();

          // body
          ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
          const bodyGrd = ctx.createRadialGradient(n.x - 3, n.y - 3, 0, n.x, n.y, 12);
          bodyGrd.addColorStop(0, `rgba(0,212,255,${0.3 + n.activation * 0.7})`);
          bodyGrd.addColorStop(1, `rgba(0,100,160,${0.2 + n.activation * 0.5})`);
          ctx.fillStyle = bodyGrd;
          ctx.shadowColor = COLORS.active; ctx.shadowBlur = n.activation * 20;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(0,212,255,${0.3 + n.activation * 0.6})`;
          ctx.lineWidth = 1.5; ctx.stroke();

          // fade activation
          n.activation = Math.max(0, n.activation - dt * 0.08);
        });
      });

      stateRef.current.raf = requestAnimationFrame(draw);
    }
    stateRef.current.raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      ro.disconnect();
    };
  }, [init]);

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={fire}
          disabled={firing}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {firing ? 'Propagating…' : '⚡ Fire'}
        </button>
        <button
          onClick={randomise}
          className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 transition-colors"
        >
          🎲 Randomise Weights
        </button>
        <span className="text-xs text-gray-500 italic">{info}</span>
      </div>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-xl" style={{ background: 'rgba(5,5,20,0.6)', minHeight: 240 }} />
      <p className="text-xs text-gray-600">
        {LAYERS.join(' → ')} architecture · green = positive weight · red = negative · brightness = activation
      </p>
    </div>
  );
}

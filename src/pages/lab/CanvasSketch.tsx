import { useEffect, useRef } from 'react';

export interface SketchContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  t: number;
  dt: number;
  mouse: { x: number; y: number; down: boolean };
}

export type SketchSetup = (ctx: SketchContext) => {
  draw: (ctx: SketchContext) => void;
  cleanup?: () => void;
};

interface Props {
  setup: SketchSetup;
  className?: string;
  style?: React.CSSProperties;
}

export default function CanvasSketch({ setup, className, style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d')!;

    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const mouse = { x: 0, y: 0, down: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onDown = () => { mouse.down = true; };
    const onUp   = () => { mouse.down = false; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    let startTime = performance.now();
    let lastTime  = startTime;
    let raf = 0;

    const sc: SketchContext = {
      canvas, ctx: ctx2d,
      get width()  { return canvas.width; },
      get height() { return canvas.height; },
      t: 0, dt: 0, mouse,
    };

    const { draw, cleanup } = setup(sc);

    function loop(ts: number) {
      sc.t  = (ts - startTime) / 1000;
      sc.dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      draw(sc);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cleanup?.();
    };
  }, [setup]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', background: 'rgba(5,5,20,0.8)', ...style }}
    />
  );
}

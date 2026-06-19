import { useEffect, useRef } from 'react';
import type { ReactNode, MouseEventHandler, KeyboardEventHandler } from 'react';

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  const min = 0,
    max = 100,
    throttle = 0.001;
  const parsed = parseInt(String(value), 10);
  if (parsed <= min || reducedMotion) return min;
  if (parsed >= max) return max * throttle;
  return parsed * throttle;
}

const VARIANTS: Record<string, { gap: number; speed: number; colors: string; noFocus: boolean }> = {
  default: { gap: 5, speed: 35, colors: '#f8fafc,#f1f5f9,#cbd5e1', noFocus: false },
  blue: { gap: 10, speed: 25, colors: '#e0f2fe,#7dd3fc,#0ea5e9', noFocus: false },
  yellow: { gap: 3, speed: 20, colors: '#fef08a,#fde047,#eab308', noFocus: false },
  pink: { gap: 6, speed: 80, colors: '#fecdd3,#fda4af,#e11d48', noFocus: true },
};

interface PixelCardProps {
  variant?: string;
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  pixelate?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

interface PixelData {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  speed: number;
  size: number;
  maxSize: number;
  delay: number;
  counter: number;
  isShimmer: boolean;
  isIdle: boolean;
  isReverse: boolean;
}

export default function PixelCard({
  variant = 'default',
  gap,
  speed,
  colors,
  noFocus,
  className = '',
  pixelate = false,
  onClick,
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<PixelData[]>([]);
  const groupsRef = useRef<Map<string, PixelData[]>>(new Map());
  const animRef = useRef<number>(0);
  const timePrevRef = useRef<number>(0);
  const pixelateRef = useRef(pixelate);
  const reducedRef = useRef(false);
  const initDoneRef = useRef(false);

  pixelateRef.current = pixelate;

  if (typeof window !== 'undefined') {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;
  const reducedMotion = reducedRef.current;

  const setupCanvas = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return null;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    if (w === 0 || h === 0) return null;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    return { w, h };
  };

  const createPixels = (w: number, h: number) => {
    const parsedColors = finalColors.split(',').map(hexToRgb);
    const gapVal = parseInt(String(finalGap), 10);
    const effSpeed = getEffectiveSpeed(finalSpeed, reducedMotion);
    const prePx = pixelateRef.current;
    const halfW = w / 2;
    const halfH = h / 2;

    const pxs: PixelData[] = [];
    for (let x = 0; x < w; x += gapVal) {
      for (let y = 0; y < h; y += gapVal) {
        const c = parsedColors[Math.floor(Math.random() * parsedColors.length)];
        const dist = Math.sqrt((x - halfW) ** 2 + (y - halfH) ** 2);
        const maxS = Math.random() * 1.5 + 0.5;
        pxs.push({
          x,
          y,
          r: c.r,
          g: c.g,
          b: c.b,
          speed: (Math.random() * 0.8 + 0.1) * effSpeed,
          maxSize: maxS,
          size: prePx ? maxS : 0,
          delay: reducedMotion ? 0 : dist,
          counter: prePx ? dist + 1 : 0,
          isShimmer: prePx,
          isIdle: false,
          isReverse: false,
        });
      }
    }

    pixelsRef.current = pxs;

    const groups = new Map<string, PixelData[]>();
    for (const p of pxs) {
      const key = `${p.r},${p.g},${p.b}`;
      let g = groups.get(key);
      if (!g) {
        g = [];
        groups.set(key, g);
      }
      g.push(p);
    }
    groupsRef.current = groups;
    initDoneRef.current = true;
    startAnim(pixelateRef.current ? 'appear' : 'disappear');
  };

  const deferredInit = () => {
    const dims = setupCanvas();
    if (!dims) return;
    const cb = () => createPixels(dims.w, dims.h);
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(cb, { timeout: 200 });
    } else {
      setTimeout(cb, 50);
    }
  };

  const doAnimate = (fn: 'appear' | 'disappear') => {
    animRef.current = requestAnimationFrame(() => doAnimate(fn));
    const now = performance.now();
    if (now - timePrevRef.current < 1000 / 60) return;
    timePrevRef.current = now - ((now - timePrevRef.current) % (1000 / 60));

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const groups = groupsRef.current;
    for (const [key, group] of groups) {
      if (group.length === 0) continue;
      const [r, g, b] = key.split(',').map(Number);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      for (let i = 0; i < group.length; i++) {
        const p = group[i];
        if (p.size <= 0) continue;
        const off = p.maxSize * 0.5 - p.size * 0.5;
        ctx.fillRect(p.x + off, p.y + off, p.size, p.size);
      }
    }

    const updateFn = fn === 'appear' ? updateAppear : updateDisappear;
    const pixels = pixelsRef.current;
    let allIdle = true;
    for (let i = 0; i < pixels.length; i++) {
      updateFn(pixels[i]);
      if (!pixels[i].isIdle) allIdle = false;
    }
    if (allIdle && initDoneRef.current) cancelAnimationFrame(animRef.current);
  };

  const startAnim = (name: 'appear' | 'disappear') => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  useEffect(() => {
    deferredInit();
    const observer = new ResizeObserver(() => deferredInit());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (pixelate) {
      canvas.style.transition = 'none';
      canvas.style.opacity = '1';
      startAnim('appear');
    } else {
      canvas.style.transition = 'opacity 0.5s ease-out';
      canvas.style.opacity = '0';
      startAnim('disappear');
    }
  }, [pixelate]);

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <>
      <style>{`
        .pixel-canvas {
          width: 100%; height: 100%;
          display: block;
          position: absolute; top: 0; left: 0;
          z-index: 10;
          pointer-events: none;
          will-change: transform;
          image-rendering: pixelated;
        }
        .pixel-card {
          position: relative;
          overflow: hidden;
          display: grid;
          place-items: center;
          isolation: isolate;
          border-radius: 28px;
          user-select: none;
          cursor: pointer;
        }
      `}</style>
      <div
        ref={containerRef}
        className={`pixel-card ${className}`}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={finalNoFocus ? -1 : 0}
      >
        <canvas className="pixel-canvas" ref={canvasRef} />
        <div className="relative z-[1] w-full h-full">{children}</div>
      </div>
    </>
  );
}

function updateAppear(p: PixelData) {
  if (p.isIdle) return;
  if (p.counter <= p.delay) {
    p.counter += 1;
    return;
  }
  if (p.size >= p.maxSize) p.isShimmer = true;
  if (p.isShimmer) {
    if (p.size >= p.maxSize) p.isReverse = true;
    else if (p.size <= 0.5) p.isReverse = false;
    p.size += p.isReverse ? -p.speed : p.speed;
  } else {
    p.size += 0.5;
  }
}

function updateDisappear(p: PixelData) {
  p.isShimmer = false;
  p.counter = 0;
  if (p.size <= 0) {
    p.isIdle = true;
    return;
  }
  p.size -= p.speed;
}

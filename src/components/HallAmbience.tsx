import React, { useEffect, useRef } from 'react';
import { createDepthRenderer, DepthRenderer } from './hallDepth';

import hallFull from '../assets/hall/hall-full.webp';
import hallReveal from '../assets/hall/hall-reveal.webp';
import hallDepth from '../assets/hall/hall-depth.png';

/* Deterministic pseudo-random so every render gets the same rhythm. */
const rand = (seed: number) => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * The Great Hall as one picture with depth: the hall stays put while the
 * owl's desk, the candle shelf and the floating candles shift by their own
 * depth. Until WebGL is ready (or without it) the still picture shows.
 */
export const HallBackdrop = React.forwardRef<HTMLCanvasElement>((_, ref) => (
  <>
    <div className="ov-plate" aria-hidden="true" />
    <canvas className="ov-depth" ref={ref} aria-hidden="true" />
    <div className="ov-rays" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </>
));
HallBackdrop.displayName = 'HallBackdrop';

interface Mote {
  x: number;
  y: number;
  z: number; // depth 0 (far) .. 1 (near)
  vx: number;
  vy: number;
  size: number;
  phase: number;
  twinkle: number;
}

/**
 * Drives the camera (mouse parallax + idle drift) via CSS custom properties
 * on the stage, and paints drifting dust motes on the canvas.
 */
export function useHallAmbience(
  stageRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  depthRef?: React.RefObject<HTMLCanvasElement | null>,
) {
  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0, lastMove: 0 });

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let motes: Mote[] = [];

    // pre-rendered soft mote sprite
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d')!;
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255, 236, 196, 1)');
    g.addColorStop(0.25, 'rgba(255, 210, 140, 0.55)');
    g.addColorStop(1, 'rgba(255, 190, 110, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    const seedMotes = () => {
      const count = Math.round(Math.min(140, Math.max(40, (width * height) / 12000)));
      motes = Array.from({ length: count }, (_, i) => {
        const z = Math.pow(rand(i + 7), 1.6);
        return {
          x: rand(i + 101) * width,
          y: rand(i + 203) * height,
          z,
          vx: (rand(i + 307) - 0.5) * 0.12,
          vy: -(0.06 + rand(i + 409) * 0.18) * (0.5 + z),
          size: 1.2 + z * 4.5 + (z > 0.92 ? 6 : 0),
          phase: rand(i + 503) * Math.PI * 2,
          twinkle: 0.6 + rand(i + 607) * 1.6,
        };
      });
    };

    let depth: DepthRenderer | null = null;
    let disposed = false;
    const depthCanvas = depthRef?.current ?? null;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedMotes();
      depth?.resize(Math.round(width * dpr), Math.round(height * dpr));
    };

    if (depthCanvas) {
      createDepthRenderer(depthCanvas, { image: hallFull, reveal: hallReveal, data: hallDepth })
        .then((r) => {
          if (disposed) return r?.dispose();
          depth = r;
          if (r) {
            resize();
            depthCanvas.classList.add('is-ready');
          }
        })
        .catch(() => {
          /* the still picture stays */
        });
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      if (e.clientY > rect.bottom || e.clientY < rect.top - 120) return;
      const p = pointer.current;
      p.tx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
      p.ty = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
      p.lastMove = performance.now();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(stage);

    let last = performance.now();
    const start = last;

    function tick(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(48, now - last) / 16.667;
      last = now;
      const t = (now - start) / 1000;
      const p = pointer.current;

      // let go of the pointer after a while so the idle drift takes over
      if (now - p.lastMove > 3500) {
        p.tx *= 0.985;
        p.ty *= 0.985;
      }
      const ease = 1 - Math.pow(1 - 0.06, dt);
      p.x += (p.tx - p.x) * ease;
      p.y += (p.ty - p.y) * ease;

      // slow, breathing camera drift (reference px)
      const driftX = Math.sin(t * 0.13) * 4 + Math.sin(t * 0.051) * 2;
      const driftY = Math.cos(t * 0.097) * 3;

      stage!.style.setProperty('--mx', p.x.toFixed(4));
      stage!.style.setProperty('--my', p.y.toFixed(4));
      stage!.style.setProperty('--cam-x', (-p.x * 10 + driftX).toFixed(3));
      stage!.style.setProperty('--cam-y', (-p.y * 6 + driftY).toFixed(3));
      // depth parallax: px of travel for the nearest surface (depth 1), kept small
      if (depth) {
        // camera push toward the hall (front/back): starts close and settles back,
        // then breathes in and out slowly; scrolling past the hall pushes in further.
        // Kept >= 0 so objects only ever grow, never pull their edges off the plate.
        const settle = Math.pow(1 - Math.min(1, t / 3.6), 3);
        const breathe = 0.5 - 0.5 * Math.cos(t * 0.42 + Math.sin(t * 0.13) * 0.8);
        const scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(height, 1)));
        const dolly = 0.07 * settle + 0.028 * breathe * (1 - settle) + 0.05 * scroll;
        depth.render((-p.x + driftX / 16) * 8, (-p.y + driftY / 9) * 4.5, dolly, t);
      }

      // dust
      ctx!.clearRect(0, 0, width, height);
      const scale = width / 1672;
      ctx!.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.x += (m.vx + Math.sin(t * 0.4 + m.phase) * 0.08) * dt * (0.4 + m.z);
        m.y += m.vy * dt;
        if (m.y < -20) {
          m.y = height + 20;
          m.x = Math.random() * width;
        }
        if (m.x < -20) m.x = width + 20;
        if (m.x > width + 20) m.x = -20;

        const px = m.x;
        const py = m.y;
        const tw = 0.5 + 0.5 * Math.sin(t * m.twinkle + m.phase);
        const near = m.z > 0.92;
        const alpha = near ? 0.08 + tw * 0.07 : (0.3 + m.z * 0.6) * (0.35 + tw * 0.65);
        const s = m.size * Math.max(0.6, scale);
        ctx!.globalAlpha = alpha;
        ctx!.drawImage(sprite, px - s, py - s, s * 2, s * 2);
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(tick);
    }

    const onVisibility = () => {
      if (!document.hidden && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      depth?.dispose();
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [stageRef, canvasRef, depthRef]);
}

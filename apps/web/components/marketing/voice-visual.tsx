"use client";

import { useEffect, useRef } from "react";
import type { Dictionary } from "../../lib/i18n";

const JICK = "oklch(0.72 0.16 75)";
const JALL = "oklch(0.5 0.14 50)";
const INK = "oklch(0.15 0.02 75)";

/**
 * Canvas hero visual: two voice sources (creator + brand) emit animated
 * waveforms and particles that converge on a central "match" node. Renders a
 * single static frame when the visitor prefers reduced motion.
 */
export function VoiceVisual({ dict }: { dict: Dictionary }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = dict.marketing.hero;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return; // canvas unsupported (e.g. jsdom test environment)
    }
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const source = (x: number, y: number, color: string, phase: number, tt: number) => {
      const cx = W / 2;
      const cy = H / 2;
      // waveform emanating from the source toward center
      const dx = cx - x;
      const dy = cy - y;
      const len = Math.hypot(dx, dy);
      const nx = dx / len;
      const ny = dy / len;
      const px = -ny;
      const py = nx;

      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      const steps = 46;
      for (let i = 0; i <= steps; i++) {
        const p = i / steps;
        const base = 22 * Math.sin(p * Math.PI); // envelope
        const wave = Math.sin(p * 22 - tt * 2.4 + phase) * base * (0.5 + 0.5 * p);
        const wx = x + nx * len * p + px * wave;
        const wy = y + ny * len * p + py * wave;
        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // source node
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      // traveling particle
      const tp = (tt * 0.25 + phase) % 1;
      const partAlive = tp;
      ctx.globalAlpha = 1 - Math.abs(partAlive - 0.5) * 1.4;
      ctx.beginPath();
      ctx.arc(x + dx * tp, y + dy * tp, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const draw = (tt: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;

      // faint grid rings
      ctx.strokeStyle = "oklch(0.15 0.02 75 / 0.06)";
      ctx.lineWidth = 1;
      for (let r = 40; r < Math.max(W, H); r += 44) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // two sources
      source(W * 0.16, H * 0.2, JICK, 0, tt);
      source(W * 0.84, H * 0.8, JALL, Math.PI, tt);

      // central match node: pulsing halo + solid core
      const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(tt * 2.2);
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46);
      grad.addColorStop(0, "oklch(0.72 0.16 75 / 0.55)");
      grad.addColorStop(1, "oklch(0.72 0.16 75 / 0)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.5 + pulse * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "oklch(0.96 0.018 75)";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      draw(1.2);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      if (reduced) draw(1.2);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="voice-visual">
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="voice-tag jick">
        <span className="d" /> {t.vizJick}
      </span>
      <span className="voice-tag jall">
        <span className="d" /> {t.vizJall}
      </span>
      <span className="voice-tag match">{t.vizMatch}</span>
    </div>
  );
}

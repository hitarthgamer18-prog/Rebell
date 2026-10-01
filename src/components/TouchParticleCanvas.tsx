import React, { useEffect, useRef } from 'react';
import { audioSynth } from '../utils/audioSynth';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  active: boolean;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  rotation: number;
  active: boolean;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

const MAX_PARTICLES = 65;
const MAX_SHOCKWAVES = 16;

export const TouchParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Fixed particle pool for zero memory allocation spikes
    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 35,
      size: 3,
      color: '#06b6d4',
      active: false,
    }));

    // Fixed shockwave pool
    const shockwaves: Shockwave[] = Array.from({ length: MAX_SHOCKWAVES }, () => ({
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 75,
      alpha: 1,
      color: '#06b6d4',
      rotation: 0,
      active: false,
    }));

    // Active touch points for multi-touch electric lightning arcs
    let activeTouches: TouchPoint[] = [];

    let animId: number | null = null;
    let isRunning = false;

    const cyberColors = ['#06b6d4', '#22d3ee', '#ec4899', '#f43f5e', '#a855f7', '#67e8f9'];

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    function triggerEffect(x: number, y: number, isDrag: boolean = false) {
      // Mobile haptic vibration
      if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
        try {
          navigator.vibrate(isDrag ? 8 : 16);
        } catch {}
      }

      // Audio blip
      audioSynth.playTouchSpark(x / width);

      // Deploy expanding cyber shockwave
      const freeWave = shockwaves.find((s) => !s.active);
      if (freeWave) {
        freeWave.active = true;
        freeWave.x = x;
        freeWave.y = y;
        freeWave.radius = 4;
        freeWave.maxRadius = isDrag ? 45 : 85;
        freeWave.alpha = 0.95;
        freeWave.rotation = Math.random() * Math.PI;
        freeWave.color = cyberColors[Math.floor(Math.random() * cyberColors.length)];
      }

      // Deploy cyber ion particles
      const count = isDrag ? 4 : 8;
      let spawned = 0;
      for (const p of particles) {
        if (!p.active && spawned < count) {
          p.active = true;
          p.x = x;
          p.y = y;
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.8 + Math.random() * (isDrag ? 3.2 : 5.8);
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
          p.life = 0;
          p.maxLife = 22 + Math.floor(Math.random() * 20);
          p.size = 2.5 + Math.random() * 3.5;
          p.color = cyberColors[Math.floor(Math.random() * cyberColors.length)];
          spawned++;
        }
      }

      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(render);
      }
    }

    // Draw multi-touch electric lightning arcs
    function drawLightning(x1: number, y1: number, x2: number, y2: number) {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      if (dist < 10 || dist > 450) return;

      const steps = 7;
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(x1, y1);

      let prevX = x1;
      let prevY = y1;

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const targetX = x1 + (x2 - x1) * t;
        const targetY = y1 + (y2 - y1) * t;
        const offset = (Math.random() - 0.5) * 22;
        const normX = -(y2 - y1) / dist;
        const normY = (x2 - x1) / dist;

        const curX = targetX + normX * offset;
        const curY = targetY + normY * offset;

        ctx!.lineTo(curX, curY);
        prevX = curX;
        prevY = curY;
      }

      ctx!.lineTo(x2, y2);
      ctx!.strokeStyle = '#22d3ee';
      ctx!.lineWidth = 2.2;
      ctx!.shadowColor = '#06b6d4';
      ctx!.shadowBlur = 12;
      ctx!.globalAlpha = 0.85;
      ctx!.stroke();

      // Core white bolt
      ctx!.strokeStyle = '#ffffff';
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.restore();
    }

    function render() {
      ctx!.clearRect(0, 0, width, height);
      let anyActive = false;

      // 1. Draw lightning between multiple simultaneous touches
      if (activeTouches.length >= 2) {
        anyActive = true;
        for (let i = 0; i < activeTouches.length - 1; i++) {
          for (let j = i + 1; j < activeTouches.length; j++) {
            drawLightning(activeTouches[i].x, activeTouches[i].y, activeTouches[j].x, activeTouches[j].y);
          }
        }
      }

      // 2. Render shockwaves & geometric rings
      for (const s of shockwaves) {
        if (s.active) {
          anyActive = true;
          s.radius += (s.maxRadius - s.radius) * 0.16 + 1.4;
          s.alpha *= 0.90;
          s.rotation += 0.04;

          if (s.alpha < 0.02 || s.radius >= s.maxRadius) {
            s.active = false;
          } else {
            ctx!.save();
            ctx!.translate(s.x, s.y);
            ctx!.rotate(s.rotation);

            // Outer glowing ring
            ctx!.beginPath();
            ctx!.arc(0, 0, s.radius, 0, Math.PI * 2);
            ctx!.strokeStyle = s.color;
            ctx!.globalAlpha = s.alpha;
            ctx!.lineWidth = 2.5 * s.alpha;
            ctx!.shadowColor = s.color;
            ctx!.shadowBlur = 10;
            ctx!.stroke();

            // Inner hexagonal cyber wireframe
            ctx!.beginPath();
            const hexRad = s.radius * 0.65;
            for (let h = 0; h < 6; h++) {
              const rad = (Math.PI / 3) * h;
              const hx = Math.cos(rad) * hexRad;
              const hy = Math.sin(rad) * hexRad;
              if (h === 0) ctx!.moveTo(hx, hy);
              else ctx!.lineTo(hx, hy);
            }
            ctx!.closePath();
            ctx!.strokeStyle = '#ffffff';
            ctx!.globalAlpha = s.alpha * 0.7;
            ctx!.lineWidth = 1;
            ctx!.stroke();

            ctx!.restore();
          }
        }
      }

      // 3. Render cyber ion particles
      for (const p of particles) {
        if (p.active) {
          anyActive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.life++;

          const progress = p.life / p.maxLife;
          if (progress >= 1) {
            p.active = false;
          } else {
            const alpha = 1 - progress;
            ctx!.save();
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx!.fillStyle = p.color;
            ctx!.globalAlpha = alpha;
            ctx!.shadowColor = p.color;
            ctx!.shadowBlur = 10;
            ctx!.fill();
            ctx!.restore();
          }
        }
      }

      if (anyActive) {
        animId = requestAnimationFrame(render);
      } else {
        isRunning = false;
        ctx!.clearRect(0, 0, width, height);
      }
    }

    // Touch event listeners for mobile devices
    const touchStartHandler = (e: TouchEvent) => {
      audioSynth.unlockAudio();
      activeTouches = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
      }));

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        triggerEffect(t.clientX, t.clientY, false);
      }
    };

    const touchMoveHandler = (e: TouchEvent) => {
      activeTouches = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
      }));

      if (Math.random() < 0.5) {
        const t = e.touches[0];
        if (t) triggerEffect(t.clientX, t.clientY, true);
      }
    };

    const touchEndHandler = (e: TouchEvent) => {
      activeTouches = Array.from(e.touches).map((t) => ({
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
      }));
    };

    // Pointer events for desktop
    const pointerDownHandler = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') {
        triggerEffect(e.clientX, e.clientY, false);
      }
    };

    window.addEventListener('touchstart', touchStartHandler, { passive: true });
    window.addEventListener('touchmove', touchMoveHandler, { passive: true });
    window.addEventListener('touchend', touchEndHandler, { passive: true });
    window.addEventListener('pointerdown', pointerDownHandler, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('touchstart', touchStartHandler);
      window.removeEventListener('touchmove', touchMoveHandler);
      window.removeEventListener('touchend', touchEndHandler);
      window.removeEventListener('pointerdown', pointerDownHandler);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ willChange: 'transform' }}
    />
  );
};

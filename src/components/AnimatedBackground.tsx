import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let points: Particle[] = [];
    let animationId = 0;
    let lastFrameTime = 0;
    const mouse: { x: number | null; y: number | null } = { x: null, y: null };

    const backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
    const strokeColor = theme === 'dark'
      ? 'rgba(180, 120, 20, 0.35)'
      : 'rgba(180, 120, 20, 0.2)';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targetFrameMs = 1000 / 30;
    const getPointCount = (w: number) => (w > 1200 ? 300 : w > 768 ? 200 : 100);
    const connectionDistance = 90;
    const maxConnectionsPerPoint = 6;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pointCount = getPointCount(width);
      points = Array.from({ length: pointCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
    };

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const onLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const draw = (timestamp = 0) => {
      if (prefersReducedMotion.matches) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        return;
      }

      if (timestamp - lastFrameTime < targetFrameMs) {
        animationId = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < connectionDistance) {
            const force = 0.0015;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
      }

      for (let i = 0; i < points.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < points.length; j++) {
          const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (dist < connectionDistance) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
            connections += 1;
            if (connections >= maxConnectionsPerPoint) {
              break;
            }
          }
        }
      }

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    container.addEventListener('mousemove', onMove, { passive: true });
    container.addEventListener('mouseleave', onLeave, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      window.cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <div className="site-background" ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

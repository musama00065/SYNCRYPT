"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export function NetworkBackground({ strong = false }: { strong?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement;
    if (!host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let resizeObserver: ResizeObserver | null = null;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.innerWidth < 768;
    const lowPower = prefersReducedMotion || isSmallScreen;

    const particleCount = lowPower ? 28 : strong ? 82 : 64;
    const maxDist = lowPower ? 120 : strong ? 175 : 150;
    const particles: Particle[] = [];
    let visibleCount = 8;
    let lastSpawnAt = 0;
    const spawnEveryMs = lowPower ? 900 : 420;

    const mouse = { x: -9999, y: -9999, active: false };

    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = host.clientWidth || window.innerWidth;
      height = host.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles.length = 0;
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (lowPower ? 0.08 : strong ? 0.22 : 0.18),
          vy: (Math.random() - 0.5) * (lowPower ? 0.08 : strong ? 0.22 : 0.18),
          r: Math.random() * 1.9 + 1.1,
        });
      }
      visibleCount = Math.min(10, particleCount);
      lastSpawnAt = performance.now();
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, width, 0);
      bg.addColorStop(0, "#138fca");
      bg.addColorStop(1, "#1e3f7a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      if (visibleCount < particleCount && now - lastSpawnAt >= spawnEveryMs) {
        visibleCount += 1;
        lastSpawnAt = now;
      }

      for (let i = 0; i < visibleCount; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10 || p.x > width + 10) p.vx *= -1;
        if (p.y < -10 || p.y > height + 10) p.vy *= -1;
      }

      for (let i = 0; i < visibleCount; i += 1) {
        for (let j = i + 1; j < visibleCount; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxDist) continue;

          const alpha = 1 - dist / maxDist;
          const nearMouse = mouse.active
            ? Math.hypot((a.x + b.x) / 2 - mouse.x, (a.y + b.y) / 2 - mouse.y) < 170
            : false;
          const boost = nearMouse ? 1.8 : 1;
          const baseAlpha = lowPower ? 0.2 : strong ? 0.38 : 0.28;
          ctx.strokeStyle = `rgba(210,236,255,${baseAlpha * alpha * boost})`;
          ctx.lineWidth = lowPower ? 0.45 : strong ? 0.9 : 0.65;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      if (mouse.active && !lowPower) {
        for (let i = 0; i < visibleCount; i += 1) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxDist * 0.9) continue;
          const alpha = 1 - dist / (maxDist * 0.9);
          ctx.strokeStyle = `rgba(220,245,255,${(strong ? 0.34 : 0.25) * alpha})`;
          ctx.lineWidth = strong ? 0.8 : 0.6;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        const rg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        rg.addColorStop(0, "rgba(255,255,255,0.12)");
        rg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < visibleCount; i += 1) {
        const p = particles[i];
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        g.addColorStop(0, "rgba(255,255,255,0.9)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(236,249,255,0.98)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    const onResize = () => init();
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    init();
    draw(performance.now());

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    resizeObserver = new ResizeObserver(() => init());
    resizeObserver.observe(host);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      resizeObserver?.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}

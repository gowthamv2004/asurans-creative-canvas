import { useEffect, useRef, useState } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

const COLORS = [
  'hsla(38, 92%, 50%, ',   // primary gold
  'hsla(25, 95%, 53%, ',   // accent orange
  'hsla(45, 100%, 60%, ',  // warm yellow
  'hsla(15, 80%, 45%, ',   // deep amber
  'hsla(50, 90%, 65%, ',   // light gold
];

const BackgroundVideo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize nodes
    const nodeCount = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      // Clear with fade trail
      ctx.fillStyle = 'hsla(20, 14%, 4%, 0.15)';
      ctx.fillRect(0, 0, w, h);

      // Update nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));

        // Mouse repulsion
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.02;
          node.vx += dx * force;
          node.vy += dy * force;
        }

        // Speed dampening
        node.vx *= 0.99;
        node.vy *= 0.99;
      }

      // Draw connections
      const connectionDist = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `hsla(38, 80%, 50%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with pulse
      for (const node of nodes) {
        const pulse = Math.sin(t * node.pulseSpeed * 60 + node.pulseOffset) * 0.3 + 0.7;
        const r = node.radius * pulse;
        const alpha = node.opacity * pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 6);
        gradient.addColorStop(0, node.color + (alpha * 0.4) + ')');
        gradient.addColorStop(1, node.color + '0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = node.color + alpha + ')';
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wandering aurora waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const yBase = h * (0.3 + i * 0.2);
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 4) {
          const y = yBase + Math.sin(x * 0.003 + t * (0.3 + i * 0.1)) * 40
            + Math.sin(x * 0.007 + t * 0.2) * 20;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, yBase - 60, 0, yBase + 100);
        grad.addColorStop(0, `hsla(38, 92%, 50%, 0)`);
        grad.addColorStop(0.5, `hsla(${30 + i * 10}, 90%, 50%, 0.02)`);
        grad.addColorStop(1, `hsla(38, 92%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Canvas neural network */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'hsl(20, 14%, 4%)' }}
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />

      {/* Animated glow orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-float pointer-events-none"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
};

export default BackgroundVideo;

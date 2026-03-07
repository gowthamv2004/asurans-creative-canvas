import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
  layer: number; // 0=far, 1=mid, 2=near — for parallax depth
}

const COLORS = [
  'hsla(38, 92%, 50%, ',
  'hsla(25, 95%, 53%, ',
  'hsla(45, 100%, 60%, ',
  'hsla(15, 80%, 45%, ',
  'hsla(50, 90%, 65%, ',
];

const PARALLAX_SPEEDS = [0.02, 0.05, 0.1]; // depth layers

const BackgroundVideo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const scrollRef = useRef(0);
  const timeRef = useRef(0);

  const handleScroll = useCallback(() => {
    scrollRef.current = window.scrollY;
  }, []);

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
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initialize nodes across 3 depth layers
    const nodeCount = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    nodesRef.current = Array.from({ length: nodeCount }, () => {
      const layer = Math.floor(Math.random() * 3);
      const sizeMultiplier = [0.6, 1, 1.5][layer];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseY: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        radius: (Math.random() * 2 + 1) * sizeMultiplier,
        opacity: (Math.random() * 0.4 + 0.3) * ([0.5, 0.7, 1][layer]),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        layer,
      };
    });

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
      const scroll = scrollRef.current;

      // Full clear each frame for crisp rendering
      ctx.clearRect(0, 0, w, h);

      // Dark base
      ctx.fillStyle = 'hsl(20, 14%, 4%)';
      ctx.fillRect(0, 0, w, h);

      // Parallax-shifted nebula clouds
      for (let i = 0; i < 4; i++) {
        const cloudX = w * (0.15 + i * 0.25) + Math.sin(t * 0.1 + i) * 30;
        const cloudY = h * (0.2 + i * 0.18) - scroll * PARALLAX_SPEEDS[Math.min(i, 2)] * 0.5;
        const size = 250 + i * 50;
        const gradient = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, size);
        const hue = [38, 25, 45, 15][i];
        gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.08)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 70%, 40%, 0.03)`);
        gradient.addColorStop(1, `hsla(${hue}, 60%, 30%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // Update and apply parallax to nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.baseY += node.vy;

        // Wrap around edges
        if (node.x < -10) node.x = w + 10;
        if (node.x > w + 10) node.x = -10;
        if (node.baseY < -10) node.baseY = h + 10;
        if (node.baseY > h + 10) node.baseY = -10;

        // Parallax offset
        node.y = node.baseY - scroll * PARALLAX_SPEEDS[node.layer];
        // Wrap parallax Y
        node.y = ((node.y % h) + h) % h;

        // Mouse interaction
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.015;
          node.vx += dx * force;
          node.vy += dy * force;
        }

        // Dampening
        node.vx *= 0.995;
        node.vy *= 0.995;
      }

      // Draw connections (only within same or adjacent layers)
      const connectionDist = 160;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.abs(nodes[i].layer - nodes[j].layer) > 1) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectionDist * connectionDist) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectionDist) * 0.2;
            ctx.strokeStyle = `hsla(38, 80%, 55%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with glow
      for (const node of nodes) {
        const pulse = Math.sin(t * node.pulseSpeed * 60 + node.pulseOffset) * 0.3 + 0.7;
        const r = node.radius * pulse;
        const alpha = node.opacity * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 8);
        glow.addColorStop(0, node.color + (alpha * 0.5) + ')');
        glow.addColorStop(0.4, node.color + (alpha * 0.15) + ')');
        glow.addColorStop(1, node.color + '0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 8, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = node.color + Math.min(alpha * 1.2, 1) + ')';
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aurora waves with parallax
      for (let i = 0; i < 3; i++) {
        const waveScroll = scroll * PARALLAX_SPEEDS[i] * 0.3;
        ctx.beginPath();
        const yBase = h * (0.25 + i * 0.22) - waveScroll;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= w; x += 3) {
          const y = yBase
            + Math.sin(x * 0.003 + t * (0.4 + i * 0.15)) * 50
            + Math.sin(x * 0.008 + t * 0.25 + i) * 25
            + Math.cos(x * 0.001 + t * 0.1) * 15;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, yBase - 80, 0, yBase + 120);
        grad.addColorStop(0, `hsla(38, 92%, 50%, 0)`);
        grad.addColorStop(0.4, `hsla(${30 + i * 8}, 85%, 50%, 0.035)`);
        grad.addColorStop(0.6, `hsla(${35 + i * 5}, 90%, 55%, 0.025)`);
        grad.addColorStop(1, `hsla(38, 92%, 50%, 0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Shooting stars (occasional)
      if (Math.random() < 0.003) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.5;
        const len = 60 + Math.random() * 80;
        const angle = Math.PI * 0.2 + Math.random() * 0.3;
        const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        grad.addColorStop(0, 'hsla(38, 92%, 70%, 0.8)');
        grad.addColorStop(1, 'hsla(38, 92%, 50%, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, hsl(20, 14%, 4%) 100%)',
        }}
      />
    </div>
  );
};

export default BackgroundVideo;

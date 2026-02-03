import { useEffect, useState } from 'react';
import aiBackgroundVideo from '@/assets/ai-background.mp4';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

const generateParticles = (count: number): Particle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
    opacity: Math.random() * 0.5 + 0.2,
  }));
};

const BackgroundVideo = () => {
  const [particles] = useState<Particle[]>(() => generateParticles(50));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        poster=""
      >
        <source src={aiBackgroundVideo} type="video/mp4" />
      </video>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `particle-float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Animated glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-primary/20 rounded-full blur-[120px] animate-float pointer-events-none" />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-glow-accent/20 rounded-full blur-[100px] animate-float pointer-events-none" 
        style={{ animationDelay: "-3s" }} 
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-warm/10 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
};

export default BackgroundVideo;

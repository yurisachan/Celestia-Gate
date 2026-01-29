import React, { useEffect, useRef, useState } from 'react';

// Official/High-quality Genshin Impact Wallpapers
const WALLPAPERS = [
  "https://upload-os-bbs.hoyolab.com/upload/2021/06/07/69499805/85065c7c25f54366679560f7df8547c6_1303866292723659437.png", // Liyue
  "https://upload-os-bbs.hoyolab.com/upload/2021/08/10/69499805/929a7776f8a853755255473724c96931_4966687893962650058.jpg", // Inazuma
  "https://webstatic.hoyoverse.com/upload/content/1/2022/08/15/88636f3224b7593c784784409395f137_6619641215444222168.jpg", // Sumeru
  "https://webstatic.hoyoverse.com/upload/content/1/2023/08/16/2e7421d960098f99e31a89c37257321c_4308577579893988352.jpg", // Fontaine
  "https://webstatic.hoyoverse.com/upload/op-public/2024/08/28/734265c091990443a6d7df157e841269_8345330380314488975.jpg", // Natlan
  "https://upload-os-bbs.hoyolab.com/upload/2021/07/16/1015537/116964344_4154949179904321332.jpg", // Ayaka
];

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    // Pick a random wallpaper on mount
    const randomImg = WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)];
    setBgImage(randomImg);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speedY: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedY: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.4 + 0.1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // We don't draw a solid background color anymore to let the image show through,
      // but we add a slight dark overlay for readability
      ctx.fillStyle = 'rgba(24, 27, 44, 0.4)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#d4c498'; // Gold particles

      particles.forEach((p, index) => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speedY; // Float up
        
        // Reset if off screen
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#181b2c]">
        {/* Background Image Layer */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ 
              backgroundImage: `url('${bgImage}')`,
              opacity: bgImage ? 0.6 : 0, // Fade in when loaded
              filter: 'brightness(0.7) blur(2px)'
            }}
        />
        
        {/* Gradient Overlay for bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181b2c] via-transparent to-transparent opacity-80" />

        {/* Canvas Particle Layer */}
        <canvas ref={canvasRef} className="absolute inset-0" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  );
};

export default Background;
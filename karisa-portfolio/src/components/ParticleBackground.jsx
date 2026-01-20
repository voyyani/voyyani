import React, { useEffect, useRef, useState } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameId = useRef(null);
  const lastFrameTime = useRef(0);
  
  // Device-based particle count for performance optimization
  const getParticleCount = () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
    
    // Adjust based on device capability
    if (window.innerWidth < 768) return 30; // Mobile
    if (navigator.hardwareConcurrency <= 4) return 50; // Low-end devices
    return 100; // High-end devices
  };
  
  // Intersection Observer to pause animation when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isVisible) return; // Don't animate when off-screen
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    const targetFPS = 30; // Throttle to 30fps for battery saving
    const frameDelay = 1000 / targetFPS;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Create particles based on device capability
    const particles = [];
    const particleCount = getParticleCount();
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        color: `rgba(97, 218, 251, ${Math.random() * 0.4 + 0.1})`
      });
    }
    
    const animate = (currentTime) => {
      // FPS throttling
      if (currentTime - lastFrameTime.current < frameDelay) {
        animationFrameId.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = currentTime;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw blueprint grid
      ctx.strokeStyle = 'rgba(0, 87, 146, 0.1)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Update and draw particles
      particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.angle = Math.PI - p.angle;
        if (p.y < 0 || p.y > canvas.height) p.angle = -p.angle;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isVisible]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
import React, { useEffect, useRef } from 'react';

/**
 * ThreeDBackground Component
 * Renders a rich, full-screen background animation combining:
 * 1. Central 3D Rotating Particle Sphere (connected constellation, spring physics, click shockwave).
 * 2. Left & Right Margin cascading "Language Code Rain / Translation Streams" waterfalls.
 * 3. Floating 3D Language Glyphs / Characters scattered across the ENTIRE screen width.
 * 4. Slowly flowing cosmic stardust (drifting twinkling particles wrapping borders) across the whole page.
 * 5. Animated drifting ambient light auroras (giant radial gradients).
 */
export default function ThreeDBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates tracking
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // 3D settings
    const particleCount = 85; // Sphere particles
    const focalLength = 380;
    let sphereRadius = Math.min(width, height) * 0.33; // Centered sphere radius
    const particles = [];
    const starfield = [];
    const glyphs = [];
    const sideStreams = [];

    // Language glyph set
    const charSet = ['文', 'हि', 'あ', 'Ω', 'Я', 'Ç', 'ñ', '한', 'ع', 'A', 'ß', '∑', 'æ', 'Ψ', 'Ø', '🌐'];

    // 1. Initialize Flowing Cosmic Stardust (across the whole page background)
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      starfield.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.22 + 0.08, // slow flowing drift
        angle: Math.random() * Math.PI * 2, // random direction
        fadeSpeed: Math.random() * 0.005 + 0.002,
        fadeDir: Math.random() > 0.5 ? 1 : -1
      });
    }

    // 2. Initialize 3D Floating Language Glyphs (scattered across the ENTIRE screen)
    const glyphCount = 22; // Increased count to cover the whole background space
    for (let i = 0; i < glyphCount; i++) {
      glyphs.push({
        char: charSet[Math.floor(Math.random() * charSet.length)],
        x: (Math.random() - 0.5) * width * 1.6, // full width
        y: Math.random() * height * 1.5 - height * 0.25,
        z: Math.random() * 500 - 150,
        speed: Math.random() * 0.35 + 0.15,
        rotSpeed: Math.random() * 0.01 - 0.005,
        angle: Math.random() * Math.PI * 2,
        baseFontSize: Math.random() * 12 + 13
      });
    }

    // 3. Initialize Central 3D Sphere Particles
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(1 - (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const y = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const z = sphereRadius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        tx: x,
        ty: y,
        tz: z,
        vx: 0,
        vy: 0,
        vz: 0,
        colorType: Math.random() > 0.45 ? 'sky' : 'indigo',
        size: Math.random() * 1.5 + 1.2
      });
    }

    // 4. Initialize Vertical Language matrix side streams (Left & Right margins)
    const streamCount = 14;
    const initializeStreams = () => {
      sideStreams.length = 0;
      for (let i = 0; i < streamCount; i++) {
        const isLeft = i < streamCount / 2;
        const x = isLeft
          ? Math.random() * width * 0.14 + width * 0.02
          : Math.random() * width * 0.14 + width * 0.84;
        
        sideStreams.push({
          x,
          y: Math.random() * -height - 150,
          speed: Math.random() * 1.1 + 0.6,
          chars: Array.from({ length: Math.floor(Math.random() * 8) + 10 }, () => 
            charSet[Math.floor(Math.random() * charSet.length)]
          ),
          opacity: Math.random() * 0.14 + 0.06
        });
      }
    };
    initializeStreams();

    const rotateSpeedX = 0.0006;
    const rotateSpeedY = 0.0012;
    const rotateSpeedZ = 0.0002;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      sphereRadius = Math.min(width, height) * 0.33;
      
      starfield.forEach(star => {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      });

      initializeStreams();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX - width / 2) * 0.08;
      mouse.targetY = (e.clientY - height / 2) * 0.08;

      const mouse3DX = (e.clientX - width / 2) * 0.85;
      const mouse3DY = (e.clientY - height / 2) * 0.85;

      particles.forEach(p => {
        const dx = p.x - mouse3DX;
        const dy = p.y - mouse3DY;
        const dz = p.z - 0;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 100) {
          const force = (100 - dist) / 100 * 6.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.vz += (dz / dist) * force;
        }
      });
    };

    const handleMouseDown = (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      particles.forEach(p => {
        const scale = focalLength / (focalLength + p.z);
        const projX = p.x * scale + width / 2;
        const projY = p.y * scale + height / 2;

        const dx = projX - clickX;
        const dy = projY - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 320) {
          const force = (320 - dist) * 0.22;
          p.vx += (dx / dist) * force / scale;
          p.vy += (dy / dist) * force / scale;
          p.vz += (Math.random() - 0.5) * force / scale;
        }
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    // 3D rotations helpers
    const rotateTargetX = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y1 = p.ty * cos - p.tz * sin;
      const z1 = p.tz * cos + p.ty * sin;
      p.ty = y1;
      p.tz = z1;
    };

    const rotateTargetY = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = p.tx * cos - p.tz * sin;
      const z1 = p.tz * cos + p.tx * sin;
      p.tx = x1;
      p.tz = z1;
    };

    const rotateTargetZ = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = p.tx * cos - p.ty * sin;
      const y1 = p.ty * cos + p.tx * sin;
      p.tx = x1;
      p.ty = y1;
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const timeMs = Date.now();

      // 1. Draw Oscillating Ambient Glow Auroras
      const glow1X = width / 2 + Math.sin(timeMs * 0.00025) * width * 0.3;
      const glow1Y = height / 2 + Math.cos(timeMs * 0.00035) * height * 0.3;
      const glow2X = width / 2 + Math.cos(timeMs * 0.0003) * width * 0.3;
      const glow2Y = height / 2 + Math.sin(timeMs * 0.0004) * height * 0.3;

      const grad1 = ctx.createRadialGradient(glow1X, glow1Y, 50, glow1X, glow1Y, Math.max(width, height) * 0.55);
      grad1.addColorStop(0, 'rgba(14, 165, 233, 0.045)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(glow2X, glow2Y, 50, glow2X, glow2Y, Math.max(width, height) * 0.55);
      grad2.addColorStop(0, 'rgba(99, 102, 241, 0.045)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Flowing Cosmic Stardust (slow moving background dust covering full page)
      for (let i = 0; i < starfield.length; i++) {
        const star = starfield[i];
        
        // Float/Drift stars
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Twinkle stars
        star.alpha += star.fadeSpeed * star.fadeDir;
        if (star.alpha > 0.85) {
          star.alpha = 0.85;
          star.fadeDir = -1;
        } else if (star.alpha < 0.1) {
          star.alpha = 0.1;
          star.fadeDir = 1;
        }

        // Boundary wrapping
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${star.alpha * 0.35})`;
        ctx.fill();
      }

      // 3. Draw Cascading language side streams (Margins)
      sideStreams.forEach(s => {
        s.y += s.speed;
        if (s.y > height) {
          s.y = -350;
          const isLeft = s.x < width / 2;
          s.x = isLeft
            ? Math.random() * width * 0.14 + width * 0.02
            : Math.random() * width * 0.14 + width * 0.84;
        }

        for (let k = 0; k < s.chars.length; k++) {
          const charY = s.y + k * 20;
          if (charY > 0 && charY < height) {
            const isLeader = k === s.chars.length - 1;
            const alpha = isLeader 
              ? s.opacity * 2.8 
              : s.opacity * (1 - (s.chars.length - k) / s.chars.length);
            
            ctx.save();
            ctx.font = isLeader ? 'bold 13px monospace' : '11px monospace';
            ctx.fillStyle = isLeader
              ? `rgba(56, 189, 248, ${alpha})`
              : `rgba(99, 102, 241, ${alpha * 0.8})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(s.chars[k], s.x, charY);
            ctx.restore();
          }
        }

        if (Math.random() < 0.035) {
          s.chars[Math.floor(Math.random() * s.chars.length)] = charSet[Math.floor(Math.random() * charSet.length)];
        }
      });

      // 4. Draw 3D Floating Language Glyphs (Floating across the ENTIRE width & height)
      for (let i = 0; i < glyphs.length; i++) {
        const g = glyphs[i];
        g.y -= g.speed;
        g.angle += g.rotSpeed;

        const scale = focalLength / (focalLength + g.z);
        const projX = g.x * scale + width / 2;
        const projY = g.y * scale + height / 2;

        if (projY < -60) {
          g.y = height + 100;
          g.x = (Math.random() - 0.5) * width * 1.6;
          g.z = Math.random() * 500 - 150;
          g.char = charSet[Math.floor(Math.random() * charSet.length)];
          continue;
        }

        if (projX > -50 && projX < width + 50) {
          ctx.save();
          ctx.translate(projX, projY);
          ctx.rotate(g.angle);
          
          const normalizedZ = (g.z + 150) / 650;
          const opacity = Math.max(0.04, Math.min(0.22, (1 - normalizedZ) * 0.22)) * scale;
          
          ctx.font = `semibold ${g.baseFontSize * scale}px system-ui, -apple-system, sans-serif`;
          ctx.fillStyle = `rgba(148, 163, 184, ${opacity})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(g.char, 0, 0);
          ctx.restore();
        }
      }

      // 5. Update 3D sphere rotation targets & spring physics
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const currentAngleX = rotateSpeedX + mouse.y * 0.00008;
      const currentAngleY = rotateSpeedY + mouse.x * 0.00008;

      particles.forEach(p => {
        rotateTargetX(p, currentAngleX);
        rotateTargetY(p, currentAngleY);
        rotateTargetZ(p, rotateSpeedZ);

        const spring = 0.065;
        const friction = 0.82;
        
        p.vx += (p.tx - p.x) * spring;
        p.vy += (p.ty - p.y) * spring;
        p.vz += (p.tz - p.z) * spring;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        p.vx *= friction;
        p.vy *= friction;
        p.vz *= friction;
      });

      // 6. Project sphere particles to 2D
      const projected = [];
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const scale = focalLength / (focalLength + p.z);
        const projX = p.x * scale + width / 2;
        const projY = p.y * scale + height / 2;

        projected.push({
          x: projX,
          y: projY,
          z: p.z,
          scale,
          colorType: p.colorType,
          size: p.size * scale,
          originalIndex: i
        });
      }

      projected.sort((a, b) => b.z - a.z);

      // 7. Draw connection lines and traveling light pulses for the sphere
      ctx.lineWidth = 0.65;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.scale < 0.38) continue;

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.scale < 0.38) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = sphereRadius * 0.42;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            if (p1.colorType === 'sky' && p2.colorType === 'sky') {
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            } else if (p1.colorType === 'indigo' && p2.colorType === 'indigo') {
              ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            }
            ctx.stroke();

            // Traveling pulses
            if ((p1.originalIndex + p2.originalIndex) % 3 === 0) {
              const speedFactor = 2200;
              const offset = (p1.originalIndex * 0.17 + p2.originalIndex * 0.23);
              const progress = ((timeMs / speedFactor) + offset) % 1.0;

              const pulseX = p1.x + (p2.x - p1.x) * progress;
              const pulseY = p1.y + (p2.y - p1.y) * progress;
              const pulseScale = p1.scale + (p2.scale - p1.scale) * progress;

              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 1.45 * pulseScale, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 2.8})`;
              ctx.fill();
            }
          }
        }
      }

      // 8. Draw sphere points
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const normalizedZ = (p.z + sphereRadius) / (sphereRadius * 2);
        const opacity = Math.max(0.06, Math.min(0.82, (1 - normalizedZ) * 0.75));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.colorType === 'sky') {
          ctx.fillStyle = `rgba(14, 165, 233, ${opacity})`;
        } else {
          ctx.fillStyle = `rgba(99, 102, 241, ${opacity})`;
        }
        ctx.fill();

        if (opacity > 0.45) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
          if (p.colorType === 'sky') {
            ctx.fillStyle = `rgba(14, 165, 233, ${opacity * 0.12})`;
          } else {
            ctx.fillStyle = `rgba(99, 102, 241, ${opacity * 0.12})`;
          }
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-45 transition-opacity duration-1000"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, type UserRole } from '@/store/useAppStore';
import { 
  Users, 
  Leaf, 
  Flame, 
  Map, 
  ShieldCheck, 
  Server, 
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  Compass,
  MapPin,
  Cpu,
  Tv,
  Train,
  Sun,
  Activity,
  Zap,
  Globe
} from 'lucide-react';
import { soundManager } from '@/lib/sounds';
import { getTranslation } from '@/lib/translations';
import { useInView } from 'framer-motion';

// A. Reusable CountUp animation component triggered by scroll view
const CountUpNumber = ({ value, duration = 1.8 }: { value: number; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    const stepTime = Math.max(12, Math.floor((duration * 1000) / 120)); // cap refresh cycles
    let current = start;

    const timer = setInterval(() => {
      const increment = Math.ceil((end - current) / 8);
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
};

// B. Live Counter component to simulate micro-flickering metric fluctuations (sensor ticking)
const LiveCounter = ({ base, range, decimals = 0, suffix = '', interval = 2500 }: { base: number, range: number, decimals?: number, suffix?: string, interval?: number }) => {
  const [val, setVal] = useState(base);

  useEffect(() => {
    setVal(base);
    const timer = setInterval(() => {
      const delta = (Math.random() * 2 - 1) * range;
      setVal(base + delta);
    }, interval);
    return () => clearInterval(timer);
  }, [base, range, interval]);

  return <span>{val.toFixed(decimals)}{suffix}</span>;
};

// 1. WebGL Background Shader Component (with Mouse coordinates uniform)
const BackgroundShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window !== 'undefined') {
        mouseRef.current.x = e.clientX / window.innerWidth;
        mouseRef.current.y = 1.0 - (e.clientY / window.innerHeight);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 mouse;
      varying vec2 uv;

      void main() {
        vec2 st = uv;
        // Deep background color #050816
        vec3 color1 = vec3(0.02, 0.03, 0.08);
        vec3 color2 = vec3(0.12, 0.06, 0.22); // Purple accent
        vec3 color3 = vec3(0.01, 0.16, 0.26); // Teal accent

        float t = time * 0.12;
        float wave = sin(st.x * 5.0 + t) * cos(st.y * 5.0 - t * 0.6);
        
        // Interactive mouse spot glow
        float distToMouse = distance(st, mouse);
        float mouseGlow = smoothstep(0.45, 0.0, distToMouse) * 0.35;

        vec3 color = mix(color1, color2, clamp(wave * 0.5 + 0.5, 0.0, 1.0));
        color = mix(color, color3, st.y * 0.25 * sin(t * 0.2));
        
        // Blend in the mouse interaction spotlight
        color += vec3(0.4, 0.3, 0.6) * mouseGlow;

        // Subtle tech grid lines
        vec2 grid = abs(fract(st * 20.0 - 0.5) - 0.5);
        float line = min(grid.x, grid.y);
        color += vec3(0.06, 0.18, 0.38) * (1.0 - smoothstep(0.0, 0.025, line)) * 0.15;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');
    const resolutionLoc = gl.getUniformLocation(program, 'resolution');
    const mouseLoc = gl.getUniformLocation(program, 'mouse');

    let animationFrameId: number;
    const render = (now: number) => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform1f(timeLoc, now * 0.001);
      gl.uniform2f(resolutionLoc, width, height);
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-[-1] pointer-events-none" />;
};

// 2. WebGL Energy Wave Shader Component (For Sustainability Bento Card)
const CardShader = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float time;
      uniform vec2 resolution;
      varying vec2 uv;

      void main() {
        vec2 st = uv;
        vec3 color1 = vec3(0.01, 0.04, 0.06); // Deep emerald background
        vec3 color2 = vec3(0.01, 0.18, 0.11); // Emerald glow
        vec3 color3 = vec3(0.0, 0.15, 0.28);   // Cyan grid

        float t = time * 0.35;
        float wave = sin(st.x * 8.0 + t) * cos(st.y * 8.0 - t * 0.6);
        vec3 color = mix(color1, color2, clamp(wave * 0.5 + 0.5, 0.0, 1.0));
        color = mix(color, color3, st.x * 0.35 * sin(t * 0.25));

        vec2 grid = abs(fract(st * 15.0 - 0.5) - 0.5);
        float line = min(grid.x, grid.y);
        color += vec3(0.05, 0.45, 0.25) * (1.0 - smoothstep(0.0, 0.04, line)) * 0.18;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');
    const resolutionLoc = gl.getUniformLocation(program, 'resolution');

    let animationFrameId: number;
    const render = (now: number) => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      gl.uniform1f(timeLoc, now * 0.001);
      gl.uniform2f(resolutionLoc, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />;
};

// 3. React Magnetic Button Component
const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode, className: string, onClick?: () => void }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState('translate(0px, 0px)');

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * 0.22}px, ${y * 0.22}px) scale(1.03)`);
  };

  const handleMouseLeave = () => {
    setTransform('translate(0px, 0px) scale(1)');
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.12s ease-out' }}
      className={className}
    >
      {children}
    </button>
  );
};

// Static mapping of Tailwind color properties to bypass compile pruning (escalating visual weight scale, avoiding red/rose danger indicator)
const accentClasses: Record<string, {
  border: string;
  glow: string;
  text: string;
  badgeBg: string;
  badgeBorder: string;
  bg: string;
}> = {
  blue: {
    border: 'hover:border-blue-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.22)]',
    text: 'group-hover:text-blue-400',
    badgeBg: 'bg-blue-950/70',
    badgeBorder: 'border-blue-500/30',
    bg: 'bg-blue-500'
  },
  teal: {
    border: 'hover:border-teal-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.22)]',
    text: 'group-hover:text-teal-400',
    badgeBg: 'bg-teal-950/70',
    badgeBorder: 'border-teal-500/30',
    bg: 'bg-teal-500'
  },
  amber: {
    border: 'hover:border-amber-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.22)]',
    text: 'group-hover:text-amber-400',
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-500/30',
    bg: 'bg-amber-500'
  },
  violet: {
    border: 'hover:border-violet-500/50',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.22)]',
    text: 'group-hover:text-violet-400',
    badgeBg: 'bg-violet-950/70',
    badgeBorder: 'border-violet-500/30',
    bg: 'bg-violet-500'
  }
};

// 4. React Magnetic Portal Card Component (Cropping top portion of Stitch screenshot assets to eliminate double headers)
const PortalCard = ({ role, path, imgSrc, title, desc, accent, badgeText, navigateToRole }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate(0px, 0px)');
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTransform(`translate(${x * 0.08}px, ${y * 0.08}px) scale(1.025)`);
  };

  const handleMouseLeave = () => {
    setTransform('translate(0px, 0px) scale(1)');
    setHovered(false);
  };

  const activeStyles = accentClasses[accent];

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToRole(role, path); } }}
      onClick={() => navigateToRole(role, path)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      style={{ transform, transition: 'transform 0.15s ease-out' }}
      className={`group relative aspect-[4/5] glass-panel rounded-[32px] overflow-hidden cursor-pointer w-full text-left border border-border/30 transition-all duration-300 flex flex-col justify-between p-6 ${activeStyles.border} ${activeStyles.glow}`}
    >
      {/* HUD corner accents */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/15 transition duration-300"></div>
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/15 transition duration-300"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/15 transition duration-300"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/15 transition duration-300"></div>

      {/* Local Background Image with absolute top crop offset to exclude baked-in headers */}
      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 group-hover:scale-[1.05] transition-all duration-700 pointer-events-none select-none z-[0] overflow-hidden">
        <img 
          src={imgSrc} 
          alt={title}
          className="absolute -top-[15%] left-0 w-full h-[135%] object-cover object-center"
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent z-[1] pointer-events-none"></div>

      {/* Bottom Text and Action triggers */}
      <div className="z-10 mt-auto">
        {/* Top HUD Badge */}
        <div className={`mb-3 px-2.5 py-0.8 rounded text-[8px] font-mono w-fit uppercase tracking-widest border transition duration-300 ${activeStyles.badgeBg} ${activeStyles.badgeBorder} ${activeStyles.text}`}>
          {badgeText}
        </div>
        <h5 className={`text-base font-bold text-white transition mb-1 uppercase tracking-wide flex items-center justify-between ${activeStyles.text}`}>
          <span>{title}</span>
          <ArrowRight className="h-4 w-4 transform -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
        </h5>
        <p className="text-[11px] text-neutral-400 leading-normal line-clamp-2">
          {desc}
        </p>
        
        {/* Custom animated progress line */}
        <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${activeStyles.bg}`}
            style={{ width: hovered ? '100%' : '0%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { metrics, alerts, setRole, language } = useAppStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const portalsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigateToRole = (role: UserRole, path: string) => {
    soundManager.playModeSound(role);
    setRole(role);
    router.push(path);
  };

  const scrollToPortals = () => {
    soundManager.playClick();
    portalsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStats = () => {
    soundManager.playClick();
    statsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] relative overflow-hidden bg-[#050816] text-[#e6e0e9] flex flex-col items-center">
      {/* 1. Global WebGL background shader */}
      <BackgroundShader />

      {/* Cyber Grid Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1d1b20_1px,transparent_1px),linear-gradient(to_bottom,#1d1b20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] z-[-1] pointer-events-none opacity-20"></div>

      {/* Main Content shell */}
      <div className="relative max-w-6xl w-full px-6 sm:px-12 py-16 space-y-24 z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section aria-label="Hero Section" className="flex flex-col items-center justify-center text-center py-8 min-h-[500px] space-y-8">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-pulse">
              <span className="flex h-2 w-2 rounded-full bg-primary glow-pulse"></span>
              <span className="font-label-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {getTranslation(language, 'fifaReady')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-none max-w-5xl">
              The AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Operating System</span> powering FIFA World Cup 2026
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mb-10 leading-relaxed opacity-85">
              A cognitive infrastructure layer connecting 16 host cities, 48 teams, and 1.5M fans. Real-time orchestration of security, logistics, and spatial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <MagneticButton 
                onClick={scrollToPortals}
                className="px-8 py-4 bg-primary text-black hover:bg-primary/90 font-bold rounded-full transition hover:shadow-[0_0_30px_rgba(207,188,255,0.4)] flex items-center gap-2 text-xs tracking-wider uppercase cursor-pointer"
              >
                <span>{getTranslation(language, 'enterPortal')}</span>
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              <MagneticButton 
                onClick={scrollToStats}
                className="px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition text-xs tracking-wider uppercase cursor-pointer"
              >
                View live telemetry
              </MagneticButton>
            </div>
          </div>

          {/* Redesigned Visual Anchor: Interactive, Alive HUD Telemetry panel directly inside the Hero */}
          <div className="w-full rounded-[40px] glass-panel p-1.5 overflow-hidden relative border border-border/30 group shadow-2xl mt-12 max-w-5xl">
            <div className="aspect-video w-full rounded-[38px] bg-[#0A0D1D]/90 flex items-center justify-center relative overflow-hidden">
              
              {/* Animated scanlines, radial fade, and targeting lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none z-10"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,8,22,0.85)_100%)] z-10 pointer-events-none"></div>

              {/* Conic-gradient radar sweep overlay (GPU accelerated rotation, will-change: transform) */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[382px] h-[382px] rounded-full opacity-[0.25] pointer-events-none animate-[spin_5s_linear_infinite] will-change-transform z-10"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, rgba(6,182,212,0) 0deg, rgba(6,182,212,0.45) 360deg)',
                  maskImage: 'radial-gradient(circle, black 35%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 35%, transparent 70%)'
                }}
              />

              {/* Holographic concentric target circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-25 pointer-events-none select-none z-10">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="170" fill="none" stroke="rgba(207, 188, 255, 0.3)" strokeWidth="1" strokeDasharray="5 7" className="origin-center animate-[spin_60s_linear_infinite]" />
                  <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" strokeDasharray="3 5" className="origin-center animate-[spin_40s_linear_reverse_infinite]" />
                  <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="1" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(255,255,255,0.03)" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.03)" />
                  {/* Outer sweeping line for precise radar sweep indication */}
                  <line x1="200" y1="200" x2="200" y2="30" stroke="rgba(6, 182, 212, 0.5)" strokeWidth="1.5" className="origin-center animate-[spin_5s_linear_infinite] will-change-transform" />
                </svg>
              </div>

              {/* Staggered pulsing location pins on the radar map (Organic breathing effect, GPU accelerated) */}
              {[
                { id: 'pin-1', label: 'VIP SUITE A', x: '50%', y: '28%', delay: '0.2s', color: 'bg-cyan-500' },
                { id: 'pin-2', label: 'GATE 3 INGRESS', x: '72%', y: '35%', delay: '0.9s', color: 'bg-teal-400' },
                { id: 'pin-3', label: 'CONCOURSE FOOD HUB', x: '70%', y: '65%', delay: '1.5s', color: 'bg-amber-400' },
                { id: 'pin-4', label: 'SECTOR D RAMP', x: '50%', y: '78%', delay: '0.6s', color: 'bg-indigo-400' },
                { id: 'pin-5', label: 'WEST MEDIA PLAZA', x: '28%', y: '50%', delay: '2.1s', color: 'bg-cyan-400' },
              ].map((marker) => (
                <div 
                  key={marker.id} 
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-20"
                  style={{ left: marker.x, top: marker.y }}
                >
                  <span className="relative flex h-3.5 w-3.5">
                    <span 
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marker.color}`}
                      style={{ animationDelay: marker.delay, animationDuration: '2.8s' }}
                    ></span>
                    <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border border-white/20 shadow-md ${marker.color}`}></span>
                  </span>
                  <div className="absolute top-6 bg-neutral-950/90 border border-border/30 px-2 py-0.5 rounded text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-lg">
                    {marker.label}
                  </div>
                </div>
              ))}

              {/* HUD corner overlays with live ticking/fluctuating metrics */}
              <div className="absolute top-8 left-8 flex flex-col gap-3.5 z-20 pointer-events-none">
                <div className="glass-panel rounded-2xl p-4 border border-border/30 border-l-4 border-l-primary text-left">
                  <span className="font-label-mono text-[9px] text-primary block mb-1 uppercase tracking-widest">STADIUM_ID</span>
                  <span className="font-bold text-xs sm:text-sm text-white">METLIFE_NJ // Node-04</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-border/30 text-left">
                  <span className="font-label-mono text-[9px] text-muted-foreground block mb-1 uppercase tracking-widest">CROWD_DENSITY</span>
                  <span className="font-bold text-xs sm:text-sm text-white font-mono">
                    <LiveCounter base={90.4} range={1.4} decimals={1} suffix="%" interval={2800} />
                  </span>
                </div>
              </div>

              <div className="absolute top-8 right-8 flex flex-col gap-3.5 z-20 items-end pointer-events-none">
                {/* Live Ingress Flow with count changes */}
                <div className="glass-panel rounded-2xl p-4 border border-border/30 text-right">
                  <span className="font-label-mono text-[9px] text-muted-foreground block mb-1 uppercase tracking-widest">INGRESS_FLOW</span>
                  <span className="font-bold text-xs sm:text-sm text-cyan-400 font-mono">
                    +<LiveCounter base={metrics.gateThroughput} range={18} decimals={0} suffix=" / min" interval={2200} />
                  </span>
                </div>
              </div>

              {/* Pulsing Live indicator */}
              <div className="absolute bottom-8 left-8 flex items-center gap-2 z-20 bg-neutral-950/80 px-3.5 py-1 rounded-full border border-border/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="font-label-mono text-[8px] text-cyan-400 uppercase tracking-widest font-bold">LIVE RADAR TARGETING</span>
              </div>

              {/* Systems Nominal indicator */}
              <div className="absolute bottom-8 right-8 flex items-center gap-2 z-20 bg-neutral-950/80 px-3.5 py-1 rounded-full border border-border/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                </span>
                <span className="font-label-mono text-[8px] text-emerald-400 uppercase tracking-widest font-bold">SYS_NOMINAL</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LIVE STATS STRIP (with intersection-observer triggered count-up numbers) */}
        <section ref={statsRef} aria-label="Telemetry Overview" className="py-6 border-y border-white/5 bg-neutral-950/30 backdrop-blur-sm rounded-3xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/5">
            
            <div className="flex flex-col items-center p-4">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 border border-blue-500/20">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-extrabold text-white leading-none mb-1 font-mono">
                <CountUpNumber value={metrics.totalAttendance} />
              </h3>
              <p className="font-label-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Active Fan Sessions</p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mb-3 border border-teal-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-extrabold text-white leading-none mb-1 font-mono">
                <CountUpNumber value={48} />
              </h3>
              <p className="font-label-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">National Teams Unified</p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 mb-3 border border-violet-500/20">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-extrabold text-white leading-none mb-1 font-mono">
                <CountUpNumber value={16} />
              </h3>
              <p className="font-label-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Host City Nodes</p>
            </div>

          </div>
        </section>

        {/* 4. FEATURE BENTO GRID */}
        <section aria-label="Core Infrastructure Features" className="space-y-8 text-left">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Core Orchestration Layers
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Deep integration across every physical and digital touchpoint of the tournament.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6 h-auto md:h-[650px]">
            
            {/* Bento 1: Flagship Differentiator: Crowd Intelligence AI (Large Card) */}
            <div className="md:col-span-8 md:row-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group border border-border/30">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 blur-2xl rounded-full"></div>
              
              <div className="relative z-10 max-w-md">
                <div className="bg-primary/20 text-primary w-fit px-3 py-1 rounded-full text-[9px] font-bold mb-4 border border-primary/30 uppercase tracking-wider">REAL-TIME</div>
                <h4 className="text-lg font-bold text-white mb-2">Crowd Intelligence AI</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Computer vision models predicting bottleneck congestion points near entry gates before they happen, optimizing flow in and out of the stadium zones.
                </p>
              </div>

              <div className="flex gap-4 items-center relative z-10">
                <div className="text-xs">
                  <span className="text-cyan-400 font-bold uppercase tracking-widest text-[9px]">Entry speed</span>
                  <div className="text-xl font-extrabold mt-0.5">+{metrics.gateThroughput}/min</div>
                </div>
                <span className="text-neutral-500 text-[10px]">|| scan active // L1</span>
              </div>

              {/* Graphic Overlay on the right */}
              <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-35 group-hover:opacity-45 transition-all duration-700 pointer-events-none overflow-hidden select-none">
                <img 
                  src="/landing_image.png" 
                  alt="Crowd Heatmap"
                  className="object-cover w-full h-full object-left group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 to-transparent"></div>
              </div>
            </div>

            {/* Bento 2: Indoor Navigation (Equal Weight) */}
            <div className="md:col-span-4 md:row-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between items-start hover:bg-white/5 transition border border-border/30">
              <div className="p-3 bg-teal-500/15 rounded-2xl text-teal-400 border border-teal-500/20">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-base font-bold text-white">Indoor Navigation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Hyper-precise wayfinding with AR overlays for concessions, seats, and accessibility routes.
                </p>
              </div>
              <span className="text-[9px] font-mono text-neutral-500 tracking-wider mt-4">OS-COMPASS-v1.0</span>
            </div>

            {/* Bento 3: Transit Hub (Equal Weight) */}
            <div className="md:col-span-4 md:row-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between items-start hover:bg-white/5 transition border border-border/30">
              <div className="p-3 bg-blue-500/15 rounded-2xl text-blue-400 border border-blue-500/20">
                <Train className="h-6 w-6" />
              </div>
              <div className="space-y-2 mt-4">
                <h4 className="text-base font-bold text-white">Transportation Hub</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Seamless last-mile logistics sync with city transit systems for 100% efficient exit strategies.
                </p>
              </div>
              <span className="text-[9px] font-mono text-neutral-500 tracking-wider mt-4">OS-TRANSIT-v1.0</span>
            </div>

            {/* Bento 4: Flagship Differentiator: Sustainability Engine (Large Card) */}
            <div className="md:col-span-8 md:row-span-1 glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group border border-border/30">
              {/* Local WebGL Shader canvas */}
              <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700 z-[0] pointer-events-none">
                <CardShader />
              </div>

              <div className="relative z-10 max-w-lg">
                <h4 className="text-lg font-bold text-white mb-2">Sustainability Engine</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI-managed energy consumption and waste tracking systems to ensure the most sustainable World Cup in history.
                </p>
              </div>

              <div className="relative z-10 flex gap-8 py-2">
                <div>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-[9px] block">Solar Grid</span>
                  <div className="text-lg font-extrabold text-white leading-none mt-1">{metrics.energySolarPercent}%</div>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold uppercase tracking-widest text-[9px] block">Water recycled</span>
                  <div className="text-lg font-extrabold text-white leading-none mt-1">{metrics.waterRecycledLiters.toLocaleString()} L</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 5. PORTAL GATEWAY SECTION */}
        <section ref={portalsRef} aria-label="Portal Interfaces" className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              {getTranslation(language, 'selectPortal')}
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-2 leading-relaxed">
              ArenaOS uses distributed role clearance matrices. Select an authorization gateway interface below to connect to operational sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Fan Portal - Level 1 (Blue) */}
            <PortalCard 
              role="fan"
              path="/fan"
              imgSrc="/fan_portal_image.png"
              title="Fan Portal"
              desc="Real-time stats, AR seat mapping, ADA transit assistance, and concession wait boards."
              accent="blue"
              badgeText="SEC_LEVEL // L1"
              navigateToRole={navigateToRole}
            />

            {/* Volunteer Portal - Level 2 (Teal) */}
            <PortalCard 
              role="staff"
              path="/operations"
              imgSrc="/landing_image.png"
              title="Volunteer Suite"
              desc="Shift schedules, task assignment queues, green telemetry tracking, and checkpoints."
              accent="teal"
              badgeText="SEC_LEVEL // L2"
              navigateToRole={navigateToRole}
            />

            {/* Staff Command Center - Level 3 (Amber) */}
            <PortalCard 
              role="security"
              path="/command"
              imgSrc="/staff_command_image.png"
              title="AI Command Center"
              desc="Crowd heatmaps, live safety alerts, simulated drills, and evacuation systems."
              accent="amber"
              badgeText="SEC_LEVEL // L3"
              navigateToRole={navigateToRole}
            />

            {/* Organizer Suite - Level 4 (Violet) */}
            <PortalCard 
              role="organizer"
              path="/organizer"
              imgSrc="/landing_image.png"
              title="Organizer HQ"
              desc="Global tournament coordinator controls, simulated safety overrides, and cash logs."
              accent="violet"
              badgeText="SEC_LEVEL // L4"
              navigateToRole={navigateToRole}
            />

          </div>
        </section>

      </div>

      {/* 6. FOOTER */}
      <footer className="w-full max-w-6xl px-6 sm:px-12 py-16 border-t border-white/5 mt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 text-left">
          <div className="max-w-sm">
            <span className="text-lg font-black text-white block mb-4 tracking-tighter uppercase">ArenaOS</span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Designing the cognitive infrastructure layer for mass human gathering. Distributed security, logistics, and telemetry for the world's greatest stage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-xs">
            <div>
              <h6 className="font-label-mono text-primary uppercase mb-4 tracking-widest text-[9px]">Platform</h6>
              <ul className="space-y-2 text-neutral-400">
                <li><a className="hover:text-primary transition" href="#">Infrastructure</a></li>
                <li><a className="hover:text-primary transition" href="#">AI Models</a></li>
                <li><a className="hover:text-primary transition" href="#">Security</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-label-mono text-primary uppercase mb-4 tracking-widest text-[9px]">Legal</h6>
              <ul className="space-y-2 text-neutral-400">
                <li><a className="hover:text-primary transition" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition" href="#">Terms of OS</a></li>
                <li><a className="hover:text-primary transition" href="#">Data Ethics</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-40 text-xs">
          <p className="font-label-mono uppercase">© 2026 FIFA World Cup™ - Powered by ArenaOS</p>
          <div className="flex items-center gap-4">
            <span className="font-label-mono">Uptime: 99.998%</span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

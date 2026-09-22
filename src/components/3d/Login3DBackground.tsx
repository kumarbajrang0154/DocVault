'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Login3DBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  themePreset?: string;
}

// 1. R3F Wave Mesh Component (Animated Gradient Mesh Plane)
function WaveMesh({
  primaryHex,
  secondaryHex,
}: {
  primaryHex: string;
  secondaryHex: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color1 = useMemo(() => new THREE.Color(primaryHex), [primaryHex]);
  const color2 = useMemo(() => new THREE.Color(secondaryHex), [secondaryHex]);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(35, 25, 45, 45);
  }, []);

  const pos = geometry.attributes.position;
  const initialZ = useMemo(() => {
    const arr = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      arr[i] = pos.getZ(i);
    }
    return arr;
  }, [pos]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 0.35 + t * 1.2) * 1.2 +
        Math.cos(y * 0.35 + t * 0.9) * 0.8 +
        initialZ[i];
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.05;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-1.1, 0, 0]} position={[0, -2, -5]}>
      <meshStandardMaterial
        color={color1}
        emissive={color2}
        emissiveIntensity={0.25}
        wireframe={true}
        transparent={true}
        opacity={0.35}
        roughness={0.2}
      />
    </mesh>
  );
}

// 2. R3F Floating Particles Component
function ParticleField({
  primaryHex,
  secondaryHex,
}: {
  primaryHex: string;
  secondaryHex: string;
}) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 250;
    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);

    const c1 = new THREE.Color(primaryHex);
    const c2 = new THREE.Color(secondaryHex);

    for (let i = 0; i < count; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * 35;
      posArr[i * 3 + 1] = (Math.random() - 0.5) * 35;
      posArr[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const mix = Math.random();
      const col = c1.clone().lerp(c2, mix);
      colArr[i * 3] = col.r;
      colArr[i * 3 + 1] = col.g;
      colArr[i * 3 + 2] = col.b;
    }

    return [posArr, colArr];
  }, [primaryHex, secondaryHex]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.04;
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.4}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </Float>
  );
}

// 3. Main Exported 3D Background Wrapper
export function Login3DBackground({
  primaryColor,
  secondaryColor,
  backgroundColor = '#09090b',
  themePreset = 'aurora',
}: Login3DBackgroundProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [computedPrimary, setComputedPrimary] = useState(primaryColor || '#6366f1');
  const [computedSecondary, setComputedSecondary] = useState(secondaryColor || '#8b5cf6');

  // Compute fallback CSS variables if props omitted
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rootStyle = window.getComputedStyle(document.documentElement);
    const primaryCss = rootStyle.getPropertyValue('--primary-color').trim() || rootStyle.getPropertyValue('--color-primary').trim();
    const secondaryCss = rootStyle.getPropertyValue('--secondary-color').trim() || rootStyle.getPropertyValue('--color-secondary').trim();

    if (!primaryColor && primaryCss) setComputedPrimary(primaryCss);
    else if (primaryColor) setComputedPrimary(primaryColor);

    if (!secondaryColor && secondaryCss) setComputedSecondary(secondaryCss);
    else if (secondaryColor) setComputedSecondary(secondaryColor);
  }, [primaryColor, secondaryColor]);

  // Feature detect WebGL
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (_e) {
      setHasWebGL(false);
    }
  }, []);

  // Mobile viewport detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Tab visibility detection to pause animation loop when hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fallback static CSS gradient background if WebGL is unavailable or on mobile viewports
  if (!hasWebGL || isMobile) {
    return (
      <div
        className="fixed inset-0 -z-10 pointer-events-none transition-all duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${computedPrimary}30 0%, ${computedSecondary}20 50%, ${backgroundColor} 100%)`,
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none w-full h-full overflow-hidden opacity-75 transition-opacity duration-700">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        frameloop={isTabVisible ? 'always' : 'never'}
        gl={{ powerPreference: 'high-performance', alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={computedPrimary} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color={computedSecondary} />

        <WaveMesh primaryHex={computedPrimary} secondaryHex={computedSecondary} />
        <ParticleField primaryHex={computedPrimary} secondaryHex={computedSecondary} />
      </Canvas>
    </div>
  );
}

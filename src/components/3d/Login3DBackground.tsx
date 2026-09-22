'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Login3DBackgroundProps {
  themePreset?: 'aurora' | 'particles' | 'waves' | 'cybergrid' | string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
}

export function Login3DBackground({
  themePreset = 'aurora',
  primaryColor = '#6366f1',
  secondaryColor = '#8b5cf6',
  accentColor = '#22d3ee',
  backgroundColor = '#09090b',
}: Login3DBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    // Feature detect WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch (_e) {
      setHasWebGL(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // Mobile check: reduce particle count / geometry density on mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Clear previous canvas if any
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const color1 = new THREE.Color(primaryColor);
    const color2 = new THREE.Color(secondaryColor);
    const color3 = new THREE.Color(accentColor);

    let animId: number;
    let isTabVisible = true;

    // 1. PARTICLES PRESET
    if (themePreset === 'particles') {
      const particleCount = isMobile ? 120 : 350;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        const mixColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
        colors[i * 3] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: isMobile ? 0.35 : 0.45,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      const animate = (time: number) => {
        if (isTabVisible) {
          const t = time * 0.0005;
          particleSystem.rotation.y = t * 0.15;
          particleSystem.rotation.x = Math.sin(t * 0.1) * 0.1;
          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    // 2. WAVES PRESET
    else if (themePreset === 'waves') {
      const gridX = isMobile ? 30 : 60;
      const gridY = isMobile ? 30 : 60;
      const geometry = new THREE.PlaneGeometry(35, 35, gridX, gridY);

      const material = new THREE.MeshBasicMaterial({
        color: color1,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });

      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -Math.PI / 3;
      plane.position.y = -4;
      scene.add(plane);

      const pos = geometry.attributes.position;
      const initialZ = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) {
        initialZ[i] = pos.getZ(i);
      }

      const animate = (time: number) => {
        if (isTabVisible) {
          const t = time * 0.0015;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = Math.sin(x * 0.3 + t) * 1.2 + Math.cos(y * 0.3 + t) * 1.2;
            pos.setZ(i, z);
          }
          pos.needsUpdate = true;
          plane.rotation.z = t * 0.05;
          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    // 3. CYBERGRID PRESET
    else if (themePreset === 'cybergrid') {
      const gridHelper = new THREE.GridHelper(60, 40, color1, color2);
      gridHelper.position.y = -6;
      gridHelper.rotation.x = 0.2;
      scene.add(gridHelper);

      const light = new THREE.PointLight(color3, 2, 50);
      light.position.set(0, 5, 10);
      scene.add(light);

      const animate = (time: number) => {
        if (isTabVisible) {
          const t = time * 0.001;
          gridHelper.position.z = (t * 2) % 1.5;
          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    // 4. AURORA PRESET (DEFAULT)
    else {
      const gridDensity = isMobile ? 30 : 60;
      const geometry = new THREE.PlaneGeometry(40, 30, gridDensity, gridDensity);
      const material = new THREE.MeshBasicMaterial({
        color: color2,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -1.1;
      mesh.position.y = -2;
      scene.add(mesh);

      const pos = geometry.attributes.position;

      const animate = (time: number) => {
        if (isTabVisible) {
          const t = time * 0.001;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z =
              Math.sin(x * 0.2 + t) * Math.cos(y * 0.2 + t) * 2.2 +
              Math.sin(x * 0.4 + t * 1.5) * 0.8;
            pos.setZ(i, z);
          }
          pos.needsUpdate = true;
          mesh.rotation.z = Math.sin(t * 0.1) * 0.05;
          renderer.render(scene, camera);
        }
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }

    // Visibility Listener: pause rendering when tab is hidden to save CPU/battery
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [themePreset, primaryColor, secondaryColor, accentColor, backgroundColor]);

  if (!hasWebGL) {
    // Fallback static CSS gradient background if WebGL is unavailable
    return (
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br transition-all duration-700 opacity-60"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${primaryColor}25 0%, ${secondaryColor}15 50%, ${backgroundColor} 100%)`,
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-80 transition-opacity duration-700"
    />
  );
}

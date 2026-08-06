import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ParticleBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 1. PARTICLES (15,000 Points)
    const particleCount = 15000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(0x001f3f);
    const highlightColor = new THREE.Color(0xccff00);

    const spreadX = 240;
    const spreadY = 160;
    const spreadZ = 200;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * spreadZ;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle texture (soft glow dot)
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(136,170,255,0.6)');
      grad.addColorStop(1, 'rgba(3,0,20,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      map: particleTexture,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 2. ENERGY LINES (530 Lines)
    const lineCount = 530;
    const linesGroup = new THREE.Group();

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
    });

    const lineData: { line: THREE.Line; speed: number; length: number; initialY: number; initialX: number }[] = [];

    for (let i = 0; i < lineCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const length = 10 + Math.random() * 25;
      const x = (Math.random() - 0.5) * 220;
      const y = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 200;

      const points = new Float32Array([
        x, y, z,
        x, y, z - length
      ]);

      lineGeo.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const line = new THREE.Line(lineGeo, lineMaterial);
      linesGroup.add(line);

      lineData.push({
        line,
        speed: 0.4 + Math.random() * 0.8,
        length,
        initialX: x,
        initialY: y,
      });
    }

    scene.add(linesGroup);

    // Pointer / Interaction
    const mouseScreen = new THREE.Vector2(-999, -999);
    const mouse3D = new THREE.Vector3(0, 0, 0);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const handleMouseMove = (event: MouseEvent) => {
      mouseScreen.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseScreen.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseScreen, camera);
      raycaster.ray.intersectPlane(plane, mouse3D);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotate particle group subtly
      particleSystem.rotation.y = elapsedTime * 0.015;
      linesGroup.rotation.y = elapsedTime * 0.01;

      // Move energy lines forward in Z space
      for (let i = 0; i < lineCount; i++) {
        const item = lineData[i];
        item.line.position.z += item.speed;
        if (item.line.position.z > 120) {
          item.line.position.z = -120;
        }
      }

      // Repulse particles near cursor and interpolate color to #CCFF00
      const posAttr = particleGeometry.attributes.position as THREE.BufferAttribute;
      const colAttr = particleGeometry.attributes.color as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colArray = colAttr.array as Float32Array;

      const radius = 22;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        let px = originalPositions[i3];
        let py = originalPositions[i3 + 1];
        let pz = originalPositions[i3 + 2];

        // Transform particle pos by particleSystem rotation
        const cos = Math.cos(particleSystem.rotation.y);
        const sin = Math.sin(particleSystem.rotation.y);
        const worldX = px * cos + pz * sin;
        const worldY = py;
        const worldZ = -px * sin + pz * cos;

        const dx = worldX - mouse3D.x;
        const dy = worldY - mouse3D.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mixFactor = 0;

        if (dist < radius) {
          const force = (1 - dist / radius) * 6;
          const angle = Math.atan2(dy, dx);

          posArray[i3] = px + Math.cos(angle) * force;
          posArray[i3 + 1] = py + Math.sin(angle) * force;

          mixFactor = (1 - dist / radius) * 0.4;
        } else {
          // Spring back to original pos
          posArray[i3] += (originalPositions[i3] - posArray[i3]) * 0.05;
          posArray[i3 + 1] += (originalPositions[i3 + 1] - posArray[i3 + 1]) * 0.05;
        }

        // Color interpolation (base space blue to electric lime)
        colArray[i3] = THREE.MathUtils.lerp(baseColor.r, highlightColor.r, mixFactor);
        colArray[i3 + 1] = THREE.MathUtils.lerp(baseColor.g, highlightColor.g, mixFactor);
        colArray[i3 + 2] = THREE.MathUtils.lerp(baseColor.b, highlightColor.b, mixFactor);
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();
      lineMaterial.dispose();
      lineData.forEach((item) => item.line.geometry.dispose());

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

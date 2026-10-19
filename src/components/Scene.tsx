import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { SwordSwarm } from './SwordSwarm';
import { ShieldOrb } from './ShieldOrb';
import { PhotoGallery3D } from './PhotoGallery3D';
import { GreetingCard3D } from './GreetingCard3D';
import { DivineLightning } from './DivineLightning';
import { MagicCircle } from './MagicCircle';
import { CameraController } from './CameraController';

function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 2500;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 80 + Math.random() * 50;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const tint = Math.random();
      if (tint > 0.5) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.35;
        col[i * 3 + 2] = 0.65; // Rose sparkle
      } else if (tint > 0.25) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 0.2; // Gold sparkle
      } else {
        col[i * 3] = 0.9;
        col[i * 3 + 1] = 0.2;
        col[i * 3 + 2] = 0.5; // Deep ruby sparkle
      }
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.008;
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.004;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.35}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function SpiritParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const r = Math.random();
      if (r > 0.5) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.3;
        col[i * 3 + 2] = 0.6; // Rose blossom
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.84;
        col[i * 3 + 2] = 0.2; // Gold
      }
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const posArr = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 1] += Math.sin(time + i * 0.5) * 0.02 + 0.012;
        posArr[i * 3] += Math.cos(time * 0.6 + i) * 0.015;
        if (posArr[i * 3 + 1] > 25) {
          posArr[i * 3 + 1] = -25;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Celestial Ground Grid in Rose Gold
function HoloGroundGrid() {
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.rotation.z = clock.getElapsedTime() * 0.025;
    }
  });

  return (
    <mesh ref={gridRef} position={[0, -12, 10]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 40, 64]} />
      <meshBasicMaterial
        color="#e91e63"
        wireframe
        transparent
        opacity={0.16}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function Scene() {
  return (
    <>
      {/* Bright Luxury Pearlescent Champagne Background */}
      <color attach="background" args={['#fff0f5']} />
      <fog attach="fog" args={['#fff0f5', 25, 95]} />

      <StarField />
      <SpiritParticles />
      <HoloGroundGrid />

      {/* Bright Luxury Lighting Setup */}
      <ambientLight intensity={0.65} color="#fff5f8" />
      <pointLight position={[0, 10, 20]} intensity={3.5} color="#ff4081" distance={70} />
      <pointLight position={[0, -6, 15]} intensity={2.8} color="#ffd700" distance={65} />
      <directionalLight position={[12, 28, 20]} intensity={2.0} color="#fff8e7" />

      {/* Core components */}
      <CameraController />
      <SwordSwarm />
      <ShieldOrb />
      <PhotoGallery3D />
      <GreetingCard3D />
      <DivineLightning />
      <MagicCircle />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.3}
          intensity={1.3}
          radius={0.5}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

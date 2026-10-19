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

// Star & Sparkle Field (Luxury Rose & Gold)
function StarField() {
  const starsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 50 + Math.random() * 60;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const tint = Math.random();
      if (tint > 0.5) {
        col[i * 3] = 0.9;
        col[i * 3 + 1] = 0.12;
        col[i * 3 + 2] = 0.38; // Rich Rose Ruby
      } else if (tint > 0.25) {
        col[i * 3] = 0.95;
        col[i * 3 + 1] = 0.65;
        col[i * 3 + 2] = 0.05; // 24K Royal Gold
      } else {
        col[i * 3] = 0.6;
        col[i * 3 + 1] = 0.05;
        col[i * 3 + 2] = 0.35; // Deep Wine
      }
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
      starsRef.current.rotation.x = clock.getElapsedTime() * 0.005;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

// Floating Flower Petals with Swirling 3D Physics
function FallingPetals() {
  const petalsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 45;

      const r = Math.random();
      if (r > 0.6) {
        col[i * 3] = 0.92;
        col[i * 3 + 1] = 0.18;
        col[i * 3 + 2] = 0.42; // Deep Rose
      } else if (r > 0.3) {
        col[i * 3] = 0.98;
        col[i * 3 + 1] = 0.72;
        col[i * 3 + 2] = 0.12; // Gold
      } else {
        col[i * 3] = 0.82;
        col[i * 3 + 1] = 0.08;
        col[i * 3 + 2] = 0.32; // Crimson
      }
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (petalsRef.current) {
      const posArr = petalsRef.current.geometry.attributes.position.array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 1] -= Math.sin(time + i * 0.4) * 0.015 + 0.035;
        posArr[i * 3] += Math.cos(time * 0.7 + i) * 0.02;
        if (posArr[i * 3 + 1] < -20) {
          posArr[i * 3 + 1] = 25;
        }
      }
      petalsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={petalsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.45}
        vertexColors
        transparent
        opacity={0.88}
        sizeAttenuation
      />
    </points>
  );
}

// Celestial Ground Mandala in Polished Gold & Rose
function HoloGroundGrid() {
  const gridRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.rotation.z = time * 0.03;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -time * 0.045;
    }
  });

  return (
    <group position={[0, -12, 10]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={gridRef}>
        <ringGeometry args={[8, 36, 64]} />
        <meshBasicMaterial
          color="#d81b60"
          wireframe
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[14, 28, 48]} />
        <meshBasicMaterial
          color="#ffd700"
          wireframe
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function Scene() {
  return (
    <>
      {/* Bright Luxury Pearlescent Champagne Background */}
      <color attach="background" args={['#fff5f8']} />
      <fog attach="fog" args={['#fff5f8', 85, 240]} />

      <StarField />
      <FallingPetals />
      <HoloGroundGrid />

      {/* Bright Luxury Lighting Setup with crisp specular contrast */}
      <ambientLight intensity={0.85} color="#fff2f6" />
      <directionalLight position={[15, 32, 25]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-18, 20, 15]} intensity={1.8} color="#ffd54f" />
      <pointLight position={[0, 8, 16]} intensity={3.5} color="#ff4081" distance={65} />
      <pointLight position={[0, -5, 12]} intensity={2.8} color="#ffa000" distance={60} />

      {/* Core components */}
      <CameraController />
      <SwordSwarm />
      <ShieldOrb />
      <PhotoGallery3D />
      <GreetingCard3D />
      <DivineLightning />
      <MagicCircle />

      {/* Bloom only for ultra-bright emissive elements, not the light background */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.92}
          luminanceSmoothing={0.25}
          intensity={1.1}
          radius={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

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
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 80 + Math.random() * 40;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const brightness = 0.5 + Math.random() * 0.5;
      col[i * 3] = brightness;
      col[i * 3 + 1] = brightness * 0.9;
      col[i * 3 + 2] = brightness + Math.random() * 0.3;
    }

    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
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

  const positions = useMemo(() => {
    const count = 250;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const posArr = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const time = clock.getElapsedTime();

      for (let i = 0; i < posArr.length / 3; i++) {
        posArr[i * 3 + 1] += Math.sin(time + i) * 0.015;
        if (posArr[i * 3 + 1] > 20) {
          posArr[i * 3 + 1] = -20;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#ff88bb"
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#030810']} />
      <fog attach="fog" args={['#030810', 30, 100]} />

      <StarField />
      <SpiritParticles />

      <ambientLight intensity={0.15} color="#6699ff" />

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
          luminanceThreshold={0.1}
          luminanceSmoothing={0.4}
          intensity={2.0}
          radius={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

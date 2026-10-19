import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore, CONFIG } from '../store';

export function ShieldOrb() {
  const stage = useHandStore((state) => state.stage);
  const orbGroupRef = useRef<THREE.Group>(null);
  const crystalShellRef = useRef<THREE.Mesh>(null);
  const goldWireRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // High-contrast swirling energy particles
  const [particlePositions, particleColors] = useMemo(() => {
    const count = 550;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const radius = CONFIG.shieldRadius * 1.05;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const ratio = Math.random();
      if (ratio > 0.6) {
        // Imperial 24K Gold
        col[i * 3] = 0.98;
        col[i * 3 + 1] = 0.72;
        col[i * 3 + 2] = 0.08;
      } else if (ratio > 0.3) {
        // Royal Ruby Rose
        col[i * 3] = 0.92;
        col[i * 3 + 1] = 0.12;
        col[i * 3 + 2] = 0.45;
      } else {
        // Deep Crimson
        col[i * 3] = 0.78;
        col[i * 3 + 1] = 0.05;
        col[i * 3 + 2] = 0.28;
      }
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    const targetPosition = useHandStore.getState().targetPosition;
    const isTracking = useHandStore.getState().isTracking;
    const currentStage = useHandStore.getState().stage;
    const time = clock.getElapsedTime();

    const isVisible = currentStage === 'FIST_ORB';

    if (orbGroupRef.current) {
      orbGroupRef.current.visible = isVisible;
      if (!isVisible) return;

      const targetScale = 1;
      orbGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );

      // Position: Smoothly follow hand, or gentle breathing float at origin
      const currentPos = isTracking
        ? targetPosition
        : new THREE.Vector3(
            Math.sin(time * 0.5) * 3,
            Math.cos(time * 0.4) * 2,
            0
          );
      orbGroupRef.current.position.lerp(currentPos, 0.12);

      // Rotations
      if (crystalShellRef.current) {
        crystalShellRef.current.rotation.y = time * 0.45;
        crystalShellRef.current.rotation.x = time * 0.25;
      }
      if (goldWireRef.current) {
        goldWireRef.current.rotation.y = -time * 0.6;
        goldWireRef.current.rotation.z = time * 0.35;
      }
      if (ring1Ref.current) {
        ring1Ref.current.rotation.x = time * 0.8;
        ring1Ref.current.rotation.y = time * 0.4;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z = -time * 0.7;
        ring2Ref.current.rotation.y = time * 0.5;
      }
      if (ring3Ref.current) {
        ring3Ref.current.rotation.x = -time * 0.5;
        ring3Ref.current.rotation.z = time * 0.65;
      }
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.9;
        particlesRef.current.rotation.x = -time * 0.4;
      }
    }
  });

  return (
    <group ref={orbGroupRef} visible={stage === 'FIST_ORB'}>
      {/* 1. Translucent Rose Quartz Crystal Shell */}
      <mesh ref={crystalShellRef}>
        <icosahedronGeometry args={[CONFIG.shieldRadius * 0.98, 2]} />
        <meshStandardMaterial
          color="#ff2d75"
          transparent
          opacity={0.38}
          roughness={0.2}
          metalness={0.3}
          emissive="#d81b60"
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 2. Sharp Gold Lattice Wireframe */}
      <mesh ref={goldWireRef}>
        <icosahedronGeometry args={[CONFIG.shieldRadius * 1.01, 2]} />
        <meshBasicMaterial
          color="#ffd700"
          wireframe
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* 3. Golden Celestial Gyroscope Rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[CONFIG.shieldRadius * 1.2, 0.12, 16, 64]} />
        <meshStandardMaterial
          color="#ffb300"
          metalness={0.9}
          roughness={0.18}
          emissive="#ff8f00"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[CONFIG.shieldRadius * 1.28, 0.1, 16, 64]} />
        <meshStandardMaterial
          color="#e91e63"
          metalness={0.85}
          roughness={0.2}
          emissive="#c2185b"
          emissiveIntensity={0.3}
        />
      </mesh>

      <mesh ref={ring3Ref} rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[CONFIG.shieldRadius * 1.36, 0.08, 16, 64]} />
        <meshStandardMaterial
          color="#ffd700"
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>

      {/* 4. Swirling High-Contrast Light Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.42}
          vertexColors
          transparent
          opacity={0.92}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

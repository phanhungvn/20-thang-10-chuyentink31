import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore, CONFIG } from '../store';

export function ShieldOrb() {
  const stage = useHandStore((state) => state.stage);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const [particlePositions, particleColors] = useMemo(() => {
    const count = 650;
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
        col[i * 3] = 0.0;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 0.65; // Cyan neon
      } else if (ratio > 0.3) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.4;
        col[i * 3 + 2] = 0.8; // Pink neon
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.88;
        col[i * 3 + 2] = 0.2; // Gold
      }
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    const targetPosition = useHandStore.getState().targetPosition;
    const isTracking = useHandStore.getState().isTracking;
    const stage = useHandStore.getState().stage;
    const time = clock.getElapsedTime();

    const shouldShow = stage === 'FIST_ORB';

    if (meshRef.current && glowRef.current && particlesRef.current) {
      const targetOpacity = shouldShow ? 0.55 : 0;
      const currentOpacity = (
        meshRef.current.material as THREE.MeshBasicMaterial
      ).opacity;
      const newOpacity = THREE.MathUtils.lerp(
        currentOpacity,
        targetOpacity,
        0.12
      );

      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = newOpacity;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = newOpacity * 0.4;
      (particlesRef.current.material as THREE.PointsMaterial).opacity = shouldShow ? 0.95 : 0;

      if (ring1Ref.current) {
        (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = newOpacity * 0.7;
      }
      if (ring2Ref.current) {
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = newOpacity * 0.7;
      }

      const isVis = newOpacity > 0.01;
      meshRef.current.visible = isVis;
      glowRef.current.visible = isVis;
      particlesRef.current.visible = isVis;
      if (ring1Ref.current) ring1Ref.current.visible = isVis;
      if (ring2Ref.current) ring2Ref.current.visible = isVis;

      const currentPos = isTracking
        ? targetPosition
        : new THREE.Vector3(
            Math.sin(time * 0.5) * 4,
            Math.cos(time * 0.4) * 3,
            0
          );

      meshRef.current.position.lerp(currentPos, 0.12);
      glowRef.current.position.lerp(currentPos, 0.12);
      particlesRef.current.position.lerp(currentPos, 0.12);
      if (ring1Ref.current) ring1Ref.current.position.lerp(currentPos, 0.12);
      if (ring2Ref.current) ring2Ref.current.position.lerp(currentPos, 0.12);

      const breathe = 1 + Math.sin(time * 3) * 0.05;
      meshRef.current.scale.setScalar(breathe);
      glowRef.current.scale.setScalar(breathe * 1.15);
      particlesRef.current.scale.setScalar(breathe * 1.08);

      meshRef.current.rotation.y = time * 0.6;
      meshRef.current.rotation.x = time * 0.3;
      particlesRef.current.rotation.y = -time * 0.8;
      particlesRef.current.rotation.z = time * 0.4;

      if (ring1Ref.current) {
        ring1Ref.current.rotation.x = time * 0.9;
        ring1Ref.current.rotation.y = time * 0.45;
        ring1Ref.current.scale.setScalar(breathe * 1.3);
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.z = -time * 0.8;
        ring2Ref.current.rotation.y = time * 0.5;
        ring2Ref.current.scale.setScalar(breathe * 1.4);
      }
    }
  });

  const innerMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0,
        wireframe: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff3388,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const ring1Material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0,
        wireframe: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const ring2Material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0,
        wireframe: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  return (
    <group visible={stage === 'FIST_ORB'}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[CONFIG.shieldRadius * 0.95, 2]} />
        <primitive object={innerMaterial} attach="material" />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[CONFIG.shieldRadius * 1.15, 32, 32]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Rotating Magic Rune Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[CONFIG.shieldRadius * 1.25, 0.08, 16, 64]} />
        <primitive object={ring1Material} attach="material" />
      </mesh>

      {/* Rotating Magic Rune Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[CONFIG.shieldRadius * 1.35, 0.08, 16, 64]} />
        <primitive object={ring2Material} attach="material" />
      </mesh>

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
          size={0.28}
          vertexColors
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useHandStore, CONFIG } from '../store';

// Simplex Noise Approximation
const simplex = {
  noise3D: (x: number, y: number, z: number) => {
    return (
      Math.sin(x * 1.2 + y * 0.8) *
      Math.cos(y * 1.1 + z * 0.9) *
      Math.sin(z * 0.7 + x * 1.3)
    );
  },
};

declare global {
  interface Window {
    swordPositions?: THREE.Vector3[];
  }
}

export function SwordSwarm() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const auraRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Physics state
  const positions = useRef<THREE.Vector3[]>([]);
  const velocities = useRef<THREE.Vector3[]>([]);

  // Initialize positions
  if (positions.current.length === 0) {
    for (let i = 0; i < CONFIG.swordCount; i++) {
      positions.current.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 12 - 4
        )
      );
      velocities.current.push(new THREE.Vector3());
    }
    window.swordPositions = positions.current;
  }

  // Masterwork Royal Sword Geometry
  const geometry = useMemo(() => {
    // 1. Tapered Diamond Cross-Section Blade
    const bladeGeo = new THREE.ConeGeometry(0.18, 3.0, 4);
    bladeGeo.scale(0.35, 1, 1);
    bladeGeo.rotateX(Math.PI / 2);
    bladeGeo.translate(0, 0, 1.2);

    // 2. Ornate Crossguard
    const guardGeo = new THREE.BoxGeometry(0.75, 0.14, 0.22);
    guardGeo.translate(0, 0, -0.22);

    // 3. Wrapped Grip
    const handleGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.8, 8);
    handleGeo.rotateX(Math.PI / 2);
    handleGeo.translate(0, 0, -0.68);

    // 4. Royal Jewel Pommel
    const pommelGeo = new THREE.SphereGeometry(0.12, 8, 8);
    pommelGeo.translate(0, 0, -1.12);

    const merged = mergeGeometries([bladeGeo, guardGeo, handleGeo, pommelGeo]);
    return merged || bladeGeo;
  }, []);

  // Polished Metallic Standard Material for Crisp Contrast on Light Background
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        metalness: 0.82,
        roughness: 0.22,
        envMapIntensity: 1.2,
      }),
    []
  );

  const auraGeometry = useMemo(() => {
    const auraGeo = new THREE.ConeGeometry(0.24, 3.2, 4);
    auraGeo.scale(0.42, 1, 1);
    auraGeo.rotateX(Math.PI / 2);
    auraGeo.translate(0, 0, 1.2);
    return auraGeo;
  }, []);

  const auraMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.4,
      }),
    []
  );

  // Set Instanced Colors (Jeweled Palette: Gold, Ruby Crimson, Sapphire, Amethyst)
  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();

    for (let i = 0; i < CONFIG.swordCount; i++) {
      const rand = (i * 17 + 7) % 100;
      if (rand < 40) {
        // Imperial 24K Gold
        color.set('#f59e0b');
      } else if (rand < 75) {
        // Royal Ruby Crimson
        color.set('#d81b60');
      } else if (rand < 90) {
        // Celestial Sapphire
        color.set('#1e40af');
      } else {
        // Imperial Amethyst
        color.set('#7e22ce');
      }
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const targetPosition = useHandStore.getState().targetPosition;
    const isTracking = useHandStore.getState().isTracking;
    const gestureMode = useHandStore.getState().gestureMode;
    const stage = useHandStore.getState().stage;
    const pathHistory = useHandStore.getState().pathHistory;
    const extendPath = useHandStore.getState().extendPath;

    const time = clock.getElapsedTime();
    const delta = 1 / 60;

    // Determine current target anchor
    let currentTarget = targetPosition;
    if (!isTracking) {
      currentTarget = new THREE.Vector3(
        Math.sin(time * 0.4) * 3,
        Math.cos(time * 0.3) * 2,
        0
      );
      pathHistory.pop();
      pathHistory.unshift(currentTarget.clone());
    } else if (gestureMode === 'DRAGON') {
      extendPath();
    }

    // Calculate targets for all swords
    for (let i = 0; i < CONFIG.swordCount; i++) {
      const pos = positions.current[i];
      const vel = velocities.current[i];
      const target = new THREE.Vector3();

      if (stage === 'CARD') {
        // ============ CARD MODE: Majestic Celestial Sunburst Ring BEHIND Letter ============
        // Swords form an expansive golden ring deep behind the card (z <= -10, radius 25-32)
        // Radiant imperial honor guard framing the card, NEVER obstructing the letter!
        const angle = (i / CONFIG.swordCount) * Math.PI * 2 + time * 0.12;
        const radius = 25 + (i % 4) * 2.2;
        const zDepth = -10.0 - (i % 3) * 2.0;

        target.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius + 0.2,
          zDepth
        );
      } else if (stage === 'FIST_ORB' || gestureMode === 'SHIELD') {
        // ============ Shield Orb Mode: Swirling Inside & Orbiting Sphere ============
        // Distribute uniformly on Fibonacci sphere
        const phi = Math.acos(1 - (2 * (i + 0.5)) / CONFIG.swordCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;

        // Radius slightly inside shield orb
        const orbitRadius = CONFIG.shieldRadius * 0.88;
        const orbitX =
          orbitRadius *
          Math.sin(phi) *
          Math.cos(theta + time * (CONFIG.shieldOrbitSpeed * 1.2));
        const orbitY =
          orbitRadius *
          Math.sin(phi) *
          Math.sin(theta + time * (CONFIG.shieldOrbitSpeed * 1.2));
        const orbitZ = orbitRadius * Math.cos(phi);

        // Gyroscopic tilt
        const rotatedX =
          orbitX * Math.cos(time * 0.4) - orbitZ * Math.sin(time * 0.4);
        const rotatedZ =
          orbitX * Math.sin(time * 0.4) + orbitZ * Math.cos(time * 0.4);

        target.set(
          currentTarget.x + rotatedX,
          currentTarget.y + orbitY,
          currentTarget.z + rotatedZ
        );

        target.x += Math.sin(time * 4 + i) * 0.25;
        target.y += Math.cos(time * 4 + i * 0.8) * 0.25;
      } else if (stage === 'GALLERY') {
        // ============ Gallery Mode: Outer Celestial Guard Halo ============
        // Swords form a grand ring surrounding the 3D gallery cards
        const angle = (i / CONFIG.swordCount) * Math.PI * 2 + time * 0.15;
        const radius = 26 + (i % 3) * 1.8;
        const height = ((i % 5) - 2) * 2.2;

        target.set(
          Math.cos(angle) * radius,
          height + 1.2,
          Math.sin(angle) * radius - 4
        );
      } else if (gestureMode === 'DAGENG' && isTracking) {
        // ============ Grand Geng Sword Array (Thiệp 20/10) ============
        if (i === 0) {
          target.set(currentTarget.x, currentTarget.y + 6, currentTarget.z);
        } else {
          const effectiveI = i - 1;
          const effectiveCount = CONFIG.swordCount - 1;
          const layerCount = 3;
          const perLayer = Math.max(1, Math.floor(effectiveCount / layerCount));
          const layerIdx = Math.floor(effectiveI / perLayer);
          const idxInLayer = effectiveI % perLayer;

          const radius = CONFIG.dagengRadius + layerIdx * 1.8 + 2;
          const dir = layerIdx % 2 === 0 ? 1 : -1;
          const theta =
            (idxInLayer / perLayer) * Math.PI * 2 +
            time * CONFIG.dagengRotateSpeed * dir;

          const hCenter = currentTarget.y - 8;
          const hRange = CONFIG.dagengHeight;
          const hRand = Math.sin(effectiveI * 13.1) * 0.5 + 0.5;
          const height = hCenter + (hRand - 0.5) * hRange;

          target.set(
            currentTarget.x + Math.cos(theta) * radius,
            height,
            currentTarget.z + Math.sin(theta) * radius
          );
        }
      } else if (gestureMode === 'LOTUS' || (!isTracking && stage === 'IDLE')) {
        // ============ Lotus Formation (Fibonacci Spiral) ============
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const maxRadius = CONFIG.lotusRadius;
        const minRadius = 5.5;

        const t = i / (CONFIG.swordCount - 1);
        const rRatio = Math.sqrt(t);
        const r = minRadius + (maxRadius - minRadius) * rRatio;

        const theta = i * goldenAngle + time * CONFIG.lotusRotateSpeed;
        const breathe = 1 + Math.sin(time * 2) * 0.06;
        const currentR = r * breathe;

        target.set(
          currentTarget.x + currentR * Math.cos(theta),
          currentTarget.y + currentR * Math.sin(theta),
          currentTarget.z + Math.sin(time * 2 + i * 0.1) * 0.3
        );
      } else {
        // ============ Dragon Flight Mode ============
        if (i < 5) {
          target.copy(currentTarget);
          target.x += Math.sin(time * 8 + i) * 0.35;
          target.y += Math.cos(time * 8 + i) * 0.35;
        } else {
          const pathIdx = i * 0.8;
          const idxA = Math.min(Math.floor(pathIdx), pathHistory.length - 1);
          const idxB = Math.min(idxA + 1, pathHistory.length - 1);
          const alpha = pathIdx - Math.floor(pathIdx);

          if (pathHistory[idxA] && pathHistory[idxB]) {
            target.lerpVectors(pathHistory[idxA], pathHistory[idxB], alpha);
          } else if (pathHistory[idxA]) {
            target.copy(pathHistory[idxA]);
          } else {
            target.copy(currentTarget);
          }

          target.x += Math.sin(time * 10 + i * 0.5) * 0.25;
          target.y += Math.cos(time * 10 + i * 0.5) * 0.25;

          const ns = CONFIG.noiseScale;
          const na =
            CONFIG.noiseStrength * (0.8 + Math.sin(time * 2 + i * 0.05) * 0.4);
          target.x += simplex.noise3D(pos.x * ns, pos.y * ns, time) * na;
          target.y += simplex.noise3D(pos.y * ns, pos.z * ns, time + 100) * na;
          target.z += simplex.noise3D(pos.z * ns, pos.x * ns, time + 200) * na;
        }
      }

      // Dynamic Speed
      let speed =
        stage === 'CARD'
          ? CONFIG.sprintSpeed * 2.2
          : stage === 'FIST_ORB' || gestureMode === 'SHIELD'
          ? CONFIG.sprintSpeed
          : CONFIG.maxSpeed;
      if (target.distanceTo(pos) > 4) speed = CONFIG.sprintSpeed;
      else if (target.distanceTo(pos) < 1)
        speed = target.distanceTo(pos) * CONFIG.maxSpeed;

      const desired = target.sub(pos);
      const d = desired.length();

      if (d > 0) {
        desired.normalize();
        if (d < 10) {
          desired.multiplyScalar(speed * (d / 10));
        } else {
          desired.multiplyScalar(speed);
        }
      }

      const steer = desired.sub(vel);
      const steerFactor =
        stage === 'CARD' ? 5.5 : stage === 'FIST_ORB' || gestureMode === 'LOTUS' ? 3.2 : 1.2;
      steer.clampLength(0, CONFIG.steerForce * delta * steerFactor);
      vel.add(steer);

      pos.add(vel.clone().multiplyScalar(delta));
      if (stage === 'CARD' && pos.z > -8.0) {
        pos.z = -8.0; // Strictly ensure swords are always deep behind the greeting card
      }
      dummy.position.copy(pos);

      // Orientation
      let lookTarget: THREE.Vector3;
      if (stage === 'CARD') {
        const outward = new THREE.Vector3(pos.x, pos.y, 0).normalize();
        lookTarget = pos.clone().add(outward);
      } else if (stage === 'FIST_ORB' || gestureMode === 'SHIELD') {
        if (vel.length() > 0.1) {
          lookTarget = pos.clone().add(vel.clone().normalize());
        } else {
          const relPos = pos.clone().sub(currentTarget);
          const tangent = new THREE.Vector3(-relPos.z, 0, relPos.x).normalize();
          lookTarget = pos.clone().add(tangent);
        }
      } else if (stage === 'GALLERY') {
        lookTarget = pos.clone().add(vel.clone().normalize());
      } else if (gestureMode === 'LOTUS') {
        const outward = pos.clone().sub(currentTarget).normalize();
        lookTarget = pos.clone().add(outward);
      } else if (gestureMode === 'DAGENG' && isTracking) {
        lookTarget = pos.clone().add(new THREE.Vector3(0, -1, 0));
      } else {
        lookTarget = pos
          .clone()
          .add(vel.length() > 0.1 ? vel : new THREE.Vector3(0, 0, -1));
      }
      dummy.lookAt(lookTarget);

      // Scale
      let targetScale = 1;
      if (gestureMode === 'DAGENG' && isTracking) {
        if (i === 0) targetScale = 6;
        else targetScale = 1.4;
      }

      const currentScale = meshRef.current.userData.currentScale || 1;
      const lerpSpeed = i === 0 && gestureMode === 'DAGENG' ? 0.015 : 0.03;
      const newScale = THREE.MathUtils.lerp(
        currentScale,
        targetScale,
        lerpSpeed
      );
      meshRef.current.userData.currentScale = newScale;

      dummy.scale.set(newScale, newScale, newScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Aura
      if (auraRef.current) {
        const isActive =
          stage === 'FIST_ORB'
            ? Math.sin(time * 25 + i * 0.4) > -0.2
            : Math.sin(time * 15 + i * 0.6) > 0.2;

        const auraScale = newScale * (isActive ? 1.25 : 1.0);
        if (!isActive && !(i === 0 && gestureMode === 'DAGENG')) {
          dummy.scale.set(0, 0, 0);
        } else {
          dummy.scale.set(auraScale, auraScale, auraScale);
        }
        dummy.updateMatrix();
        auraRef.current.setMatrixAt(i, dummy.matrix);
        dummy.scale.set(newScale, newScale, newScale);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (auraRef.current) {
      auraRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, CONFIG.swordCount]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={auraRef}
        args={[auraGeometry, auraMaterial, CONFIG.swordCount]}
        frustumCulled={false}
      />
    </group>
  );
}

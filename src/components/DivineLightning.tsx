import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore, CONFIG } from '../store';

declare global {
  interface Window {
    swordPositions?: THREE.Vector3[];
  }
}

export function DivineLightning() {
  const lineRef = useRef<THREE.LineSegments>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(100 * 3 * 2);
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xd81b60,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
      }),
    []
  );

  const intensityRef = useRef(0);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;

    const isTracking = useHandStore.getState().isTracking;
    const gestureMode = useHandStore.getState().gestureMode;
    const time = clock.getElapsedTime();

    const targetIntensity = gestureMode === 'DAGENG' ? 1 : 0;
    intensityRef.current = THREE.MathUtils.lerp(
      intensityRef.current,
      targetIntensity,
      0.02
    );
    const intensity = intensityRef.current;

    const flashSpeed = 15 + intensity * 10;
    const flashThreshold = 0.7 - intensity * 0.3;

    const count = Math.floor(30 + intensity * 70);
    const maxDist = 5 + intensity * 20;
    const jitter = 0.2 + intensity * 0.3;

    const flash = Math.sin(time * flashSpeed) > flashThreshold;
    lineRef.current.visible = flash && isTracking;
    if (!flash || !isTracking) return;

    const positions = window.swordPositions;
    if (!positions || positions.length === 0) return;

    const posAttr = lineRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    let idx = 0;

    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * CONFIG.swordCount);
      const b = Math.floor(Math.random() * CONFIG.swordCount);

      if (a >= positions.length || b >= positions.length) continue;

      const pA = positions[a];
      const pB = positions[b];

      if (pA.distanceTo(pB) < maxDist) {
        arr[idx++] = pA.x + (Math.random() - 0.5) * jitter;
        arr[idx++] = pA.y + (Math.random() - 0.5) * jitter;
        arr[idx++] = pA.z + (Math.random() - 0.5) * jitter;
        arr[idx++] = pB.x + (Math.random() - 0.5) * jitter;
        arr[idx++] = pB.y + (Math.random() - 0.5) * jitter;
        arr[idx++] = pB.z + (Math.random() - 0.5) * jitter;
      }
    }
    while (idx < arr.length) arr[idx++] = 0;
    posAttr.needsUpdate = true;
  });

  return <lineSegments ref={lineRef} geometry={geometry} material={material} />;
}

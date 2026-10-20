import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore } from '../store';

declare global {
  interface Window {
    swordPositions?: THREE.Vector3[];
  }
}

export function CameraController() {
  const { camera } = useThree();

  const SMOOTH_SPEED = 0.045; // Responsive smooth transition

  const isCardOpened = useHandStore((state) => state.isCardOpened);
  const stage = useHandStore((state) => state.stage);

  const initZoom = stage === 'CARD' && isCardOpened ? 21.0 : 25;
  const initY = stage === 'CARD' && isCardOpened ? 0.3 : 0;
  const initLookZ = stage === 'CARD' && isCardOpened ? 6.5 : 0;

  // State
  const smoothTarget = useRef(new THREE.Vector3(0, initY, 0));
  const smoothCamPos = useRef(new THREE.Vector3(0, initY, initZoom));
  const smoothLookAt = useRef(new THREE.Vector3(0, initY, initLookZ));
  const smoothZoom = useRef(initZoom);

  useFrame(({ clock }) => {
    const isTracking = useHandStore.getState().isTracking;
    const gestureMode = useHandStore.getState().gestureMode;
    const stage = useHandStore.getState().stage;
    const isCardOpened = useHandStore.getState().isCardOpened;
    const time = clock.getElapsedTime();
    const positions = window.swordPositions;

    // 1. Calculate sword formation center & size
    let formationSize = 10;
    const formationCenter = new THREE.Vector3(0, 0, 0);

    if (positions && positions.length > 0) {
      let minX = Infinity,
        maxX = -Infinity;
      let minY = Infinity,
        maxY = -Infinity;
      let sumX = 0,
        sumY = 0,
        sumZ = 0;

      for (const pos of positions) {
        minX = Math.min(minX, pos.x);
        maxX = Math.max(maxX, pos.x);
        minY = Math.min(minY, pos.y);
        maxY = Math.max(maxY, pos.y);
        sumX += pos.x;
        sumY += pos.y;
        sumZ += pos.z;
      }

      formationCenter.set(
        sumX / positions.length,
        sumY / positions.length,
        sumZ / positions.length
      );

      const spanX = maxX - minX;
      const spanY = maxY - minY;
      formationSize = Math.max(spanX, spanY);
    }

    // 2. Dynamic Target Zoom distance based on Stage
    let targetZoom: number;
    if (stage === 'CARD') {
      // Precision zoom for huge, readable 3D greeting card
      targetZoom = isCardOpened ? 21.0 : 25.0;
    } else if (stage === 'GALLERY') {
      targetZoom = 30;
    } else if (stage === 'FIST_ORB') {
      targetZoom = 26;
    } else {
      targetZoom = THREE.MathUtils.clamp(
        formationSize * 1.1 + 16,
        22,
        gestureMode === 'DAGENG' ? 45 : 60
      );
    }

    smoothZoom.current = THREE.MathUtils.lerp(
      smoothZoom.current,
      targetZoom,
      SMOOTH_SPEED
    );

    // 3. Follow Point
    let followPoint: THREE.Vector3;
    if (stage === 'CARD') {
      // Center camera squarely on the letter (0.3) or closed envelope (0.0)
      followPoint = new THREE.Vector3(0, isCardOpened ? 0.3 : 0.0, 0);
    } else if (stage === 'GALLERY') {
      followPoint = new THREE.Vector3(0, 1.2, 0);
    } else if (stage === 'FIST_ORB') {
      followPoint = isTracking
        ? useHandStore.getState().targetPosition.clone()
        : new THREE.Vector3(0, 0, 0);
    } else if (isTracking) {
      followPoint = formationCenter.clone();
    } else {
      followPoint = new THREE.Vector3(
        Math.sin(time * 0.5) * 4,
        Math.cos(time * 0.4) * 3,
        0
      );
    }
    smoothTarget.current.lerp(followPoint, SMOOTH_SPEED);

    // 4. Desired Camera Position
    const desiredCamPos = new THREE.Vector3(
      stage === 'CARD' ? 0 : smoothTarget.current.x * 0.2,
      stage === 'CARD' ? (isCardOpened ? 0.3 : 0.0) : smoothTarget.current.y * 0.15 + 2.5,
      smoothZoom.current
    );
    smoothCamPos.current.lerp(desiredCamPos, SMOOTH_SPEED);
    camera.position.copy(smoothCamPos.current);

    // 5. Desired Look At
    const desiredLookAt = new THREE.Vector3(
      stage === 'CARD' ? 0 : smoothTarget.current.x * 0.3,
      stage === 'CARD' ? (isCardOpened ? 0.3 : 0.0) : smoothTarget.current.y * 0.2,
      stage === 'CARD' ? (isCardOpened ? 6.5 : 0.0) : 4
    );
    smoothLookAt.current.lerp(desiredLookAt, SMOOTH_SPEED);
    camera.lookAt(smoothLookAt.current);
  });

  return null;
}

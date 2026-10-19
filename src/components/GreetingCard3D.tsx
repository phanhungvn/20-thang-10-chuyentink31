import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore } from '../store';

// Helper: Create texture for card cover and inner letter
function createCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 360);
  grad.addColorStop(0, '#d91e63');
  grad.addColorStop(0.5, '#c2185b');
  grad.addColorStop(1, '#880e4f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 360);

  // Gold border
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#ffd700';
  ctx.strokeRect(10, 10, 492, 340);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.strokeRect(22, 22, 468, 316);

  // Golden Ribbon
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(240, 10, 32, 340);

  // Seal in center
  ctx.beginPath();
  ctx.arc(256, 180, 72, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb300';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#880e4f';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('20-10', 256, 188);

  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('VIETNAM', 256, 210);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('THIỆP CHÚC MỪNG', 256, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createLetterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 560;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fff9f0';
  ctx.fillRect(0, 0, 512, 560);

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#e91e63';
  ctx.strokeRect(8, 8, 496, 544);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffd700';
  ctx.strokeRect(18, 18, 476, 524);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#d81b60';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('🌸 CHÚC MỪNG 20/10 🌸', 256, 70);

  ctx.font = 'italic bold 20px sans-serif';
  ctx.fillStyle = '#ad1457';
  ctx.fillText('Happy Vietnamese Women\'s Day', 256, 110);

  ctx.fillStyle = '#37474f';
  ctx.font = '19px sans-serif';
  ctx.fillText('Nhân ngày Phụ Nữ Việt Nam 20/10,', 256, 180);
  ctx.fillText('Kính chúc một nửa thế giới luôn rạng ngời,', 256, 220);
  ctx.fillText('Xinh đẹp như những đóa hoa thơm ngát,', 256, 260);
  ctx.fillText('Hạnh phúc viên mãn, vạn sự như ý', 256, 300);
  ctx.fillText('và luôn được yêu thương mỗi phút giây!', 256, 340);

  ctx.fillStyle = '#e91e63';
  ctx.font = 'italic 22px sans-serif';
  ctx.fillText('💖 Thân tặng những người phụ nữ tuyệt vời 💖', 256, 420);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function GreetingCard3D() {
  const groupRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Mesh>(null);
  const letterRef = useRef<THREE.Mesh>(null);
  const petalsRef = useRef<THREE.Points>(null);

  const stage = useHandStore((state) => state.stage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);

  const coverTex = useMemo(() => createCoverTexture(), []);
  const letterTex = useMemo(() => createLetterTexture(), []);

  useEffect(() => {
    return () => {
      coverTex.dispose();
      letterTex.dispose();
    };
  }, [coverTex, letterTex]);

  // Petals particle system
  const [petalPositions, petalColors] = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;

      const r = Math.random();
      if (r < 0.6) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.3;
        col[i * 3 + 2] = 0.6; // Rose pink
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 0.2; // Gold sparkle
      }
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const isVisible = stage === 'CARD';
    const targetScale = isVisible ? 1 : 0.0001;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    if (!isVisible) return;

    const time = clock.getElapsedTime();

    // Floating animation
    groupRef.current.position.y = 1.5 + Math.sin(time * 2) * 0.4;
    groupRef.current.rotation.y = Math.sin(time * 0.6) * 0.12;

    // Flap opening animation
    if (flapRef.current) {
      const targetFlapRot = isCardOpened ? -Math.PI * 0.85 : 0;
      flapRef.current.rotation.x = THREE.MathUtils.lerp(
        flapRef.current.rotation.x,
        targetFlapRot,
        0.08
      );
    }

    // Letter slide-out animation
    if (letterRef.current) {
      const targetLetterY = isCardOpened ? 4.2 : 0;
      const targetLetterZ = isCardOpened ? 0.3 : 0.02;
      letterRef.current.position.y = THREE.MathUtils.lerp(
        letterRef.current.position.y,
        targetLetterY,
        0.06
      );
      letterRef.current.position.z = THREE.MathUtils.lerp(
        letterRef.current.position.z,
        targetLetterZ,
        0.06
      );
    }

    // Petals burst animation
    if (petalsRef.current) {
      const pMat = petalsRef.current.material as THREE.PointsMaterial;
      pMat.opacity = THREE.MathUtils.lerp(pMat.opacity, isCardOpened ? 0.9 : 0, 0.08);

      if (isCardOpened) {
        const arr = petalsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < arr.length / 3; i++) {
          arr[i * 3 + 1] += Math.sin(time + i) * 0.03 + 0.02;
          arr[i * 3] += Math.cos(time * 0.8 + i) * 0.02;
          if (arr[i * 3 + 1] > 20) arr[i * 3 + 1] = -15;
        }
        petalsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.5, 12]} visible={stage === 'CARD'}>
      {/* Envelope Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[11, 7.5, 0.4]} />
        <meshBasicMaterial map={coverTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Envelope Flap (Hinged at top) */}
      <group position={[0, 3.75, 0.2]}>
        <mesh ref={flapRef} position={[0, 0, 0]}>
          <planeGeometry args={[11, 3.2]} />
          <meshBasicMaterial map={coverTex} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Inner Greeting Letter */}
      <mesh ref={letterRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[9.8, 10.5]} />
        <meshBasicMaterial map={letterTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Petals / Sparkles */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[petalColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.32}
          vertexColors
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore, PERSON_PROFILES } from '../store';

function createCardTexture(profile: (typeof PERSON_PROFILES)[0]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 700);
  grad.addColorStop(0, '#101a2e');
  grad.addColorStop(0.5, '#0a1020');
  grad.addColorStop(1, '#1a0d24');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 700);

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#00ffaa';
  ctx.strokeRect(10, 10, 492, 680);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 105, 180, 0.6)';
  ctx.strokeRect(24, 24, 464, 652);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff69b4';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('🌸 20 THÁNG 10 🌸', 256, 65);

  const avatarGrad = ctx.createLinearGradient(96, 100, 416, 420);
  avatarGrad.addColorStop(0, '#ff758c');
  avatarGrad.addColorStop(1, '#ff7eb3');
  ctx.fillStyle = avatarGrad;
  ctx.beginPath();
  ctx.roundRect(86, 95, 340, 320, 24);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(106, 115, 300, 280, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(profile.label, 256, 235);

  ctx.fillStyle = '#ffe066';
  ctx.font = '22px sans-serif';
  ctx.fillText('✨ TÔN VINH PHÁI ĐẸP ✨', 256, 285);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(profile.name, 256, 475);

  ctx.fillStyle = '#00ffaa';
  ctx.font = 'italic bold 22px sans-serif';
  ctx.fillText(`“${profile.role}”`, 256, 520);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '19px sans-serif';
  const wishLine = profile.wish.length > 38 ? profile.wish.slice(0, 38) + '...' : profile.wish;
  ctx.fillText(wishLine, 256, 580);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '16px monospace';
  ctx.fillText(`Người ${profile.id} / 9`, 256, 640);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function PhotoGallery3D() {
  const groupRef = useRef<THREE.Group>(null);
  const stage = useHandStore((state) => state.stage);
  const currentPhotoIndex = useHandStore((state) => state.currentPhotoIndex);

  const textures = useMemo(() => {
    return PERSON_PROFILES.map((p) => createCardTexture(p));
  }, []);

  useEffect(() => {
    return () => {
      textures.forEach((t) => t.dispose());
    };
  }, [textures]);

  const cardsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const isVisible = stage === 'GALLERY';
    const targetScale = isVisible ? 1 : 0.0001;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    if (!isVisible) return;

    const time = clock.getElapsedTime();
    const count = PERSON_PROFILES.length;
    const radius = 24;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const isActive = i === currentPhotoIndex;
      const diff = i - currentPhotoIndex;
      const angle = (diff / count) * Math.PI * 1.5;

      const targetX = Math.sin(angle) * radius;
      const targetZ = -Math.cos(angle) * radius + (isActive ? 12 : 0);
      const targetY = Math.sin(time * 2 + i * 0.8) * 0.4 + (isActive ? 1.5 : 0);

      card.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.08);

      const targetRotY = -angle * 0.7;
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.08);

      const s = isActive ? 1.35 : 0.85;
      card.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

      const mat = card.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1.0 : 0.45, 0.1);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 1, 8]} visible={stage === 'GALLERY'}>
      {PERSON_PROFILES.map((profile, i) => (
        <mesh
          key={profile.id}
          ref={(el) => {
            cardsRef.current[i] = el;
          }}
          position={[0, 0, -20]}
        >
          <planeGeometry args={[5.2, 7.1]} />
          <meshBasicMaterial
            map={textures[i]}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore, PERSON_PROFILES } from '../store';

// High-Definition Royal Card Texture (1024 x 1400)
function createCardTexture(profile: (typeof PERSON_PROFILES)[0]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d')!;

  // 1. Cosmic Deep Velvet Gradient Background
  const grad = ctx.createLinearGradient(0, 0, 1024, 1400);
  grad.addColorStop(0, '#0d1326');
  grad.addColorStop(0.3, '#141c38');
  grad.addColorStop(0.7, '#0a1024');
  grad.addColorStop(1, '#1e0c2b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1400);

  // Subtle radial glow in upper-middle
  const radGlow = ctx.createRadialGradient(512, 450, 50, 512, 450, 500);
  radGlow.addColorStop(0, 'rgba(255, 105, 180, 0.22)');
  radGlow.addColorStop(0.6, 'rgba(0, 255, 170, 0.08)');
  radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, 1024, 1400);

  // 2. Multi-layer Gold & Neon Borders
  // Outer Neon Cyan Glow Border
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#00ffaa';
  ctx.strokeRect(16, 16, 992, 1368);

  // Inner Gold Foil Border
  const goldGrad = ctx.createLinearGradient(0, 0, 1024, 1400);
  goldGrad.addColorStop(0, '#ffd700');
  goldGrad.addColorStop(0.3, '#ff7eb3');
  goldGrad.addColorStop(0.7, '#ffeaa7');
  goldGrad.addColorStop(1, '#ffd700');

  ctx.lineWidth = 4;
  ctx.strokeStyle = goldGrad;
  ctx.strokeRect(38, 38, 948, 1324);

  // Corner decorative flourishes
  const drawCorner = (x: number, y: number, rot: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(0, 0, 48, 6);
    ctx.fillRect(0, 0, 6, 48);
    ctx.beginPath();
    ctx.arc(14, 14, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  drawCorner(50, 50, 0);
  drawCorner(974, 50, Math.PI / 2);
  drawCorner(974, 1350, Math.PI);
  drawCorner(50, 1350, -Math.PI / 2);

  // 3. Header Ribbon
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff758c';
  ctx.font = 'bold 36px "Be Vietnam Pro", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('✨ TÔN VINH NGÀY PHỤ NỮ VIỆT NAM ✨', 512, 100);

  // 4. Portrait Avatar Box with Royal Frame
  const avatarGrad = ctx.createLinearGradient(160, 160, 864, 864);
  avatarGrad.addColorStop(0, '#ff758c');
  avatarGrad.addColorStop(0.5, '#ffd700');
  avatarGrad.addColorStop(1, '#00ffaa');
  ctx.fillStyle = avatarGrad;
  ctx.beginPath();
  ctx.roundRect(172, 150, 680, 640, 36);
  ctx.fill();

  // Dark Inner Cutout
  const innerGrad = ctx.createLinearGradient(200, 180, 824, 800);
  innerGrad.addColorStop(0, '#121829');
  innerGrad.addColorStop(1, '#1e1430');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.roundRect(192, 170, 640, 600, 28);
  ctx.fill();

  // Crown Emblem & Profile Label
  ctx.font = '72px sans-serif';
  ctx.fillText('👑', 512, 320);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 84px "Playfair Display", serif';
  ctx.fillText(profile.label, 512, 450);

  // Decorative Laurel Garland
  ctx.fillStyle = '#ffd700';
  ctx.font = '34px sans-serif';
  ctx.fillText('༺ ★ 20 • 10 • 2026 ★ ༻', 512, 530);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '28px sans-serif';
  ctx.fillText('Bông hoa rạng ngời của tập thể', 512, 600);

  // 5. Name Title (Big, Bold, Luxurious)
  const nameGrad = ctx.createLinearGradient(200, 0, 824, 0);
  nameGrad.addColorStop(0, '#ffffff');
  nameGrad.addColorStop(0.5, '#fff0c2');
  nameGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = nameGrad;
  ctx.font = 'bold 64px "Be Vietnam Pro", sans-serif';
  ctx.fillText(profile.name, 512, 890);

  // 6. Role Badge Pill
  ctx.fillStyle = 'rgba(0, 255, 170, 0.15)';
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(280, 930, 464, 60, 30);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#00ffaa';
  ctx.font = 'bold 30px "Be Vietnam Pro", sans-serif';
  ctx.fillText(`“${profile.role}”`, 512, 972);

  // 7. Heartfelt Wish (Multi-line with quotation marks)
  ctx.fillStyle = 'rgba(255, 245, 230, 0.95)';
  ctx.font = 'italic 34px "Playfair Display", serif';
  const wish = profile.wish;
  if (wish.length > 34) {
    // split into 2 lines nicely
    const mid = wish.lastIndexOf(' ', 34);
    const line1 = wish.slice(0, mid);
    const line2 = wish.slice(mid + 1);
    ctx.fillText(`“${line1}`, 512, 1070);
    ctx.fillText(`${line2}”`, 512, 1125);
  } else {
    ctx.fillText(`“${wish}”`, 512, 1090);
  }

  // 8. Footer Page Indicator & Golden Stars
  ctx.fillStyle = '#ffd700';
  ctx.font = '32px sans-serif';
  ctx.fillText('★★★★★', 512, 1220);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 26px monospace';
  ctx.fillText(`NHÂN VẬT ${profile.id} TRÊN 9`, 512, 1280);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function PhotoGallery3D() {
  const groupRef = useRef<THREE.Group>(null);
  const haloGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);

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

  // Halo Sparkles orbiting active card
  const [haloPositions, haloColors] = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 3.5 + Math.random() * 2.5;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = Math.sin(theta) * r;

      if (Math.random() > 0.5) {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.4;
        col[i * 3 + 2] = 0.8; // Pink neon
      } else {
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.85;
        col[i * 3 + 2] = 0.2; // Gold
      }
    }
    return [pos, col];
  }, []);

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
      const targetY = Math.sin(time * 2 + i * 0.8) * 0.35 + (isActive ? 1.6 : 0);

      card.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.09);

      const targetRotY = -angle * 0.7;
      card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, targetRotY, 0.09);

      // Gentle floating tilt
      if (isActive) {
        card.rotation.z = Math.sin(time * 1.5) * 0.02;
      } else {
        card.rotation.z = 0;
      }

      const s = isActive ? 1.38 : 0.82;
      card.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

      const mat = card.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, isActive ? 1.0 : 0.4, 0.1);
      }
    });

    // Update active halo pedestal and aura
    const activeCard = cardsRef.current[currentPhotoIndex];
    if (activeCard && haloGroupRef.current) {
      haloGroupRef.current.position.lerp(
        new THREE.Vector3(activeCard.position.x, activeCard.position.y, activeCard.position.z - 0.5),
        0.1
      );
      haloGroupRef.current.rotation.y = time * 0.6;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.8;
    }

    if (auraRef.current) {
      const breathe = 1 + Math.sin(time * 3) * 0.08;
      auraRef.current.scale.set(breathe, breathe, 1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 1, 8]} visible={stage === 'GALLERY'}>
      {/* Halo & Pedestal for Active Card */}
      <group ref={haloGroupRef} position={[0, 0, 0]}>
        {/* Soft glowing aura plane behind active card */}
        <mesh ref={auraRef} position={[0, 0, -0.4]}>
          <planeGeometry args={[7.5, 10.2]} />
          <meshBasicMaterial
            color="#ff69b4"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Circular glowing hologram ring underneath active card */}
        <mesh ref={ringRef} position={[0, -5.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 4.4, 48]} />
          <meshBasicMaterial
            color="#00ffaa"
            transparent
            opacity={0.65}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Halo Floating Particles */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[haloPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[haloColors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.22}
            vertexColors
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* 9 3D Cards */}
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

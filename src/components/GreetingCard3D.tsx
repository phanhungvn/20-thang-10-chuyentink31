import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore } from '../store';

// Helper: High-Res Envelope Cover Texture (1024 x 720)
function createCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Royal Crimson Velvet Gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 720);
  grad.addColorStop(0, '#880e4f');
  grad.addColorStop(0.3, '#c2185b');
  grad.addColorStop(0.7, '#ad1457');
  grad.addColorStop(1, '#4a0026');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 720);

  // Radial highlight
  const radGlow = ctx.createRadialGradient(512, 360, 50, 512, 360, 480);
  radGlow.addColorStop(0, 'rgba(255, 182, 193, 0.28)');
  radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, 1024, 720);

  // Gold Foil Borders
  ctx.lineWidth = 18;
  ctx.strokeStyle = '#ffd700';
  ctx.strokeRect(18, 18, 988, 684);

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.strokeRect(38, 38, 948, 644);

  // Vertical Golden Ribbon with Embroidery Pattern
  const ribbonGrad = ctx.createLinearGradient(480, 0, 544, 0);
  ribbonGrad.addColorStop(0, '#e6b800');
  ribbonGrad.addColorStop(0.5, '#fff176');
  ribbonGrad.addColorStop(1, '#e6b800');
  ctx.fillStyle = ribbonGrad;
  ctx.fillRect(480, 18, 64, 684);

  // Golden Ribbon Stitching
  ctx.strokeStyle = '#880e4f';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(486, 18);
  ctx.lineTo(486, 702);
  ctx.moveTo(538, 18);
  ctx.lineTo(538, 702);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wax Seal Embossed Badge
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  const sealGrad = ctx.createRadialGradient(512, 360, 15, 512, 360, 80);
  sealGrad.addColorStop(0, '#ffd54f');
  sealGrad.addColorStop(0.6, '#ffb300');
  sealGrad.addColorStop(1, '#c67c00');
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(512, 360, 78, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#fff8e1';
  ctx.stroke();

  // Seal Emblem
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4a0026';
  ctx.font = 'bold 36px serif';
  ctx.fillText('20•10', 512, 355);

  ctx.font = '28px sans-serif';
  ctx.fillText('👑', 512, 395);
  ctx.restore();

  // Header Calligraphy
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 44px "Playfair Display", serif';
  ctx.fillText('THIỆP CHÚC MỪNG 20/10', 512, 130);

  ctx.fillStyle = '#ffd700';
  ctx.font = '24px sans-serif';
  ctx.fillText('✦ NGÀY PHỤ NỮ VIỆT NAM ✦', 512, 180);

  // Footer Instructions
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'italic 24px sans-serif';
  ctx.fillText('Chụp 2 bàn tay hoặc nhấn nút để mở thiệp', 512, 630);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// Helper: High-Res Inner Letter Texture (1024 x 1120)
function createLetterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1120;
  const ctx = canvas.getContext('2d')!;

  // Pearlescent Cream White Background
  const grad = ctx.createLinearGradient(0, 0, 1024, 1120);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#fff9fb');
  grad.addColorStop(1, '#fcedf3');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1120);

  // Double Border: Magenta & Gold
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#c2185b';
  ctx.strokeRect(16, 16, 992, 1088);

  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffd700';
  ctx.strokeRect(36, 36, 952, 1048);

  // Decorative header flourish
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e91e63';
  ctx.font = '54px sans-serif';
  ctx.fillText('🌸 💖 👑 💖 🌸', 512, 120);

  // Title 1
  ctx.fillStyle = '#880e4f';
  ctx.font = 'bold 50px "Be Vietnam Pro", sans-serif';
  ctx.fillText('CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM', 512, 195);

  ctx.fillStyle = '#d81b60';
  ctx.font = 'bold 44px "Playfair Display", serif';
  ctx.fillText('20 THÁNG 10', 512, 255);

  // Divider line
  ctx.strokeStyle = '#ffb300';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(250, 285);
  ctx.lineTo(774, 285);
  ctx.stroke();

  // Subtitle
  ctx.fillStyle = '#ad1457';
  ctx.font = 'italic bold 30px "Playfair Display", serif';
  ctx.fillText('Happy Vietnamese Women\'s Day', 512, 335);

  // Letter Body Poem & Message
  ctx.fillStyle = '#263238';
  ctx.font = '32px "Be Vietnam Pro", sans-serif';

  const lines = [
    'Nhân ngày tôn vinh phái đẹp 20/10,',
    'Xin gửi đến toàn thể các chị, các em ngàn đóa hoa tươi thắm,',
    'Chúc một nửa thế giới luôn xinh đẹp rạng ngời,',
    'Tràn đầy tự tin, hạnh phúc viên mãn,',
    'Gặt hái nhiều thành công rực rỡ trong sự nghiệp,',
    'Và luôn là nguồn cảm hứng ấm áp, diệu kỳ nhất!',
  ];

  let startY = 440;
  lines.forEach((line) => {
    ctx.fillText(line, 512, startY);
    startY += 62;
  });

  // Footer Signature
  ctx.fillStyle = '#c2185b';
  ctx.font = 'italic bold 36px "Playfair Display", serif';
  ctx.fillText('💖 Thân tặng những người phụ nữ tuyệt vời nhất! 💖', 512, 900);

  ctx.fillStyle = '#ffd700';
  ctx.font = '38px sans-serif';
  ctx.fillText('✨ ★ ★ ★ ★ ★ ✨', 512, 970);

  ctx.fillStyle = '#78909c';
  ctx.font = '22px monospace';
  ctx.fillText('HOCENG • 20/10/2026', 512, 1030);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function GreetingCard3D() {
  const groupRef = useRef<THREE.Group>(null);
  const flapRef = useRef<THREE.Mesh>(null);
  const letterRef = useRef<THREE.Mesh>(null);
  const petalsRef = useRef<THREE.Points>(null);
  const heartsGroupRef = useRef<THREE.Group>(null);

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

  // Floating Petals & Sparkles with rich NormalBlending
  const [petalPositions, petalColors] = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35;

      const r = Math.random();
      if (r < 0.5) {
        col[i * 3] = 0.92;
        col[i * 3 + 1] = 0.12;
        col[i * 3 + 2] = 0.45; // Crimson rose
      } else if (r < 0.8) {
        col[i * 3] = 0.98;
        col[i * 3 + 1] = 0.72;
        col[i * 3 + 2] = 0.1; // Gold
      } else {
        col[i * 3] = 0.82;
        col[i * 3 + 1] = 0.05;
        col[i * 3 + 2] = 0.35; // Deep ruby
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
    groupRef.current.position.y = 1.5 + Math.sin(time * 2) * 0.45;
    groupRef.current.rotation.y = Math.sin(time * 0.7) * 0.12;

    // Flap opening animation
    if (flapRef.current) {
      const targetFlapRot = isCardOpened ? -Math.PI * 0.88 : 0;
      flapRef.current.rotation.x = THREE.MathUtils.lerp(
        flapRef.current.rotation.x,
        targetFlapRot,
        0.08
      );
    }

    // Letter slide-out animation
    if (letterRef.current) {
      const targetLetterY = isCardOpened ? 4.5 : 0;
      const targetLetterZ = isCardOpened ? 0.35 : 0.02;
      letterRef.current.position.y = THREE.MathUtils.lerp(
        letterRef.current.position.y,
        targetLetterY,
        0.07
      );
      letterRef.current.position.z = THREE.MathUtils.lerp(
        letterRef.current.position.z,
        targetLetterZ,
        0.07
      );
    }

    // Floating hearts animation when opened
    if (heartsGroupRef.current) {
      heartsGroupRef.current.visible = isCardOpened;
      if (isCardOpened) {
        heartsGroupRef.current.children.forEach((child, i) => {
          child.position.y = (Math.sin(time * 1.5 + i * 1.2) * 2) + 6;
          child.rotation.y = time * 2 + i;
          child.rotation.z = Math.sin(time + i) * 0.3;
        });
      }
    }

    // Petals burst animation
    if (petalsRef.current) {
      const pMat = petalsRef.current.material as THREE.PointsMaterial;
      pMat.opacity = THREE.MathUtils.lerp(pMat.opacity, isCardOpened ? 0.95 : 0, 0.08);

      if (isCardOpened) {
        const arr = petalsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < arr.length / 3; i++) {
          arr[i * 3 + 1] += Math.sin(time + i) * 0.04 + 0.03;
          arr[i * 3] += Math.cos(time * 0.8 + i) * 0.025;
          if (arr[i * 3 + 1] > 24) arr[i * 3 + 1] = -18;
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

      {/* 3D Floating Hearts when opened */}
      <group ref={heartsGroupRef} visible={false}>
        {[-3.5, -1.8, 0, 1.8, 3.5].map((x, i) => (
          <mesh key={i} position={[x, 5, 1]}>
            <octahedronGeometry args={[0.5]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#d81b60' : '#ffb300'}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Floating Petals / Sparkles */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[petalColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.4}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

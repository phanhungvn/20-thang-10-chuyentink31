import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore } from '../store';
import { sounds } from '../services/SoundService';

// ==========================================
// 1. Envelope Front Pocket Texture (1400 x 800)
// ==========================================
function createEnvelopePocketTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  // Royal Crimson Velvet Gradient
  const grad = ctx.createLinearGradient(0, 0, 1400, 800);
  grad.addColorStop(0, '#780036');
  grad.addColorStop(0.3, '#9c1042');
  grad.addColorStop(0.7, '#ad1457');
  grad.addColorStop(1, '#4a0026');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1400, 800);

  // Soft Radial Satin Sheen
  const radGlow = ctx.createRadialGradient(700, 400, 50, 700, 400, 600);
  radGlow.addColorStop(0, 'rgba(255, 192, 203, 0.45)');
  radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, 1400, 800);

  // Outer Gold Embroidered Border
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#ffd700';
  ctx.strokeRect(16, 16, 1368, 768);

  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.strokeRect(36, 36, 1328, 728);

  // V-Shaped Pocket Seam Lines
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(700, 360);
  ctx.moveTo(1384, 16);
  ctx.lineTo(700, 360);
  ctx.moveTo(700, 360);
  ctx.lineTo(700, 784);
  ctx.stroke();

  // Subtle pocket interior shadow
  const shadowGrad = ctx.createLinearGradient(700, 0, 700, 240);
  shadowGrad.addColorStop(0, 'rgba(30, 0, 15, 0.65)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.moveTo(16, 16);
  ctx.lineTo(700, 240);
  ctx.lineTo(1384, 16);
  ctx.closePath();
  ctx.fill();

  // Decorative Golden Laurel at Bottom Center
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('༺ ❀ 20 • 10 • 2026 ❀ ༻', 700, 680);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Playfair Display", serif';
  ctx.fillText('ĐẠI TIỆC TÔN VINH PHÁI ĐẸP', 700, 735);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// 2. Envelope Top Flap Texture (1400 x 700) - TRANSPARENT CUTOUT
// ==========================================
function createFlapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // Clear background so corners are completely transparent!
  ctx.clearRect(0, 0, 1400, 700);

  // Triangular Flap Shape: (0,0) -> (1400,0) -> (700,680)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(1400, 0);
  ctx.lineTo(700, 680);
  ctx.closePath();

  // Rich Crimson Velvet Gradient
  const grad = ctx.createLinearGradient(0, 0, 1400, 700);
  grad.addColorStop(0, '#9c1042');
  grad.addColorStop(0.5, '#c2185b');
  grad.addColorStop(1, '#880e4f');
  ctx.fillStyle = grad;
  ctx.fill();

  // Outer Gold Trim on triangular edge
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#ffd700';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(700, 680);
  ctx.lineTo(1400, 0);
  ctx.stroke();

  // Inner White Gold Accent Line
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.moveTo(25, 0);
  ctx.lineTo(700, 650);
  ctx.lineTo(1375, 0);
  ctx.stroke();

  // Top Flap Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e7';
  ctx.font = 'bold 44px "Playfair Display", serif';
  ctx.fillText('THIỆP MỪNG HOÀNG GIA', 700, 190);

  ctx.fillStyle = '#ffd54f';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('✦ HAPPY WOMEN\'S DAY ✦', 700, 245);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// 3. Inside Silk Lining Texture (1400 x 950)
// ==========================================
function createSilkLiningTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 950;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 1400, 950);
  grad.addColorStop(0, '#ffe082');
  grad.addColorStop(0.3, '#fff9c4');
  grad.addColorStop(0.6, '#ffd54f');
  grad.addColorStop(1, '#ffca28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1400, 950);

  // Subtle Damask Texture
  ctx.fillStyle = 'rgba(216, 27, 96, 0.08)';
  for (let x = 70; x < 1400; x += 140) {
    for (let y = 70; y < 950; y += 140) {
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Golden Royal Crown Crest
  ctx.textAlign = 'center';
  ctx.fillStyle = '#880e4f';
  ctx.font = '90px sans-serif';
  ctx.fillText('👑', 700, 420);

  ctx.font = 'bold 36px "Playfair Display", serif';
  ctx.fillText('20 • 10', 700, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// 4. THE 3D GREETING LETTER TEXTURE (2048 x 2560)
// ULTRA HIGH-DEFINITION, CRYSTAL CLEAR, BOLD & GORGEOUS
// ==========================================
function createLetterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2560;
  const ctx = canvas.getContext('2d')!;

  // 1. Rich Pearl Parchment Background
  const grad = ctx.createLinearGradient(0, 0, 2048, 2560);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, '#fffdf7');
  grad.addColorStop(0.75, '#fffbf0');
  grad.addColorStop(1, '#fff6e5');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 2560);

  // Soft Radial Warm Ivory Glow in Center
  const centerGlow = ctx.createRadialGradient(1024, 1280, 100, 1024, 1280, 1100);
  centerGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
  centerGlow.addColorStop(0.7, 'rgba(255, 253, 245, 0.9)');
  centerGlow.addColorStop(1, 'rgba(255, 242, 220, 0.7)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, 2048, 2560);

  // 2. Multi-Tiered Ornate Gold Filigree Borders
  // Outer Solid Gold Foil Rim
  ctx.lineWidth = 28;
  ctx.strokeStyle = '#c59b27';
  ctx.strokeRect(28, 28, 1992, 2504);

  // Inner Fine Gold Thread
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#dfb746';
  ctx.strokeRect(68, 68, 1912, 2424);

  // Subtle Rose-Gold Border Line
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(216, 27, 96, 0.45)';
  ctx.strokeRect(88, 88, 1872, 2384);

  // Corner Baroque Ornaments
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#c59b27';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = '#c59b27';
    ctx.beginPath();
    ctx.arc(40, 40, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCorner(92, 92, 0);
  drawCorner(1956, 92, Math.PI / 2);
  drawCorner(1956, 2468, Math.PI);
  drawCorner(92, 2468, -Math.PI / 2);

  // 3. Top Royal Crown & Floral Emojis
  ctx.textAlign = 'center';
  ctx.font = '110px sans-serif';
  ctx.fillText('🌸 💖 👑 💖 🌸', 1024, 250);

  // 4. Sub-header
  ctx.fillStyle = '#9c1042';
  ctx.font = 'bold 50px "Playfair Display", serif';
  ctx.fillText('✦ ĐẠI TIỆC TÔN VINH PHÁI ĐẸP 20/10 ✦', 1024, 370);

  // 5. Main Royal Title (Huge, Bold, Shadowed)
  ctx.fillStyle = '#880e4f';
  ctx.shadowColor = 'rgba(136, 14, 79, 0.25)';
  ctx.shadowBlur = 12;
  ctx.font = 'bold 84px "Playfair Display", serif';
  ctx.fillText('THƯ CHÚC MỪNG 20 THÁNG 10', 1024, 460);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#c2185b';
  ctx.font = 'italic bold 48px "Playfair Display", serif';
  ctx.fillText('Ngày Phụ Nữ Việt Nam • Happy Women\'s Day', 1024, 535);

  // Golden Floral Divider
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#c59b27';
  ctx.beginPath();
  ctx.moveTo(320, 595);
  ctx.lineTo(1728, 595);
  ctx.stroke();

  ctx.fillStyle = '#c59b27';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText('༺ ★ • 2026 • ★ ༻', 1024, 655);

  // 6. Letter Salutation (Extra Bold, Large & Dignified)
  ctx.fillStyle = '#780036';
  ctx.font = 'bold 68px "Be Vietnam Pro", sans-serif';
  ctx.fillText('Kính gửi toàn thể một nửa thế giới thân yêu!', 1024, 765);

  ctx.fillStyle = '#374151';
  ctx.font = 'bold 48px "Be Vietnam Pro", sans-serif';
  ctx.fillText('Nhân ngày Phụ Nữ Việt Nam 20/10,', 1024, 845);
  ctx.fillText('Xin trân trọng kính chúc toàn thể các chị, các em:', 1024, 910);

  // 7. Letter Body: 4-Line Poem (HUGE, BOLD 54px, CRYSTAL CLEAR)
  const poemLines = [
    { icon: '🌸', text: 'Luôn tươi vui, rạng ngời như những đóa hoa sớm mai,' },
    { icon: '💖', text: 'Nụ cười tỏa nắng, tâm hồn an yên và đong đầy hạnh phúc,' },
    { icon: '✨', text: 'Luôn tự tin, bản lĩnh gặt hái ngàn thành công rực rỡ,' },
    { icon: '🌹', text: 'Và mãi mãi được yêu thương, nâng niu trọn vẹn từng khoảnh khắc!' },
  ];

  let currentY = 1060;
  poemLines.forEach((item) => {
    // Elegant soft highlight ribbon behind each line
    ctx.fillStyle = 'rgba(255, 240, 245, 0.88)';
    ctx.beginPath();
    ctx.roundRect(194, currentY - 58, 1660, 96, 24);
    ctx.fill();

    ctx.strokeStyle = 'rgba(216, 27, 96, 0.25)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Icon + Line Text (Black/Maroon for maximum contrast)
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 54px "Be Vietnam Pro", sans-serif';
    ctx.fillText(`${item.icon}   ${item.text}`, 1024, currentY + 12);

    currentY += 148;
  });

  // 8. Bottom Divider
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c59b27';
  ctx.beginPath();
  ctx.moveTo(420, currentY + 25);
  ctx.lineTo(1628, currentY + 25);
  ctx.stroke();

  // 9. Closing Signature & Seal
  ctx.fillStyle = '#c2185b';
  ctx.font = 'italic bold 56px "Playfair Display", serif';
  ctx.fillText('💖 Thân tặng những người phụ nữ tuyệt vời nhất! 💖', 1024, currentY + 110);

  ctx.fillStyle = '#eab308';
  ctx.font = '76px sans-serif';
  ctx.fillText('★★★★★', 1024, currentY + 205);

  ctx.fillStyle = '#880e4f';
  ctx.font = 'bold 42px monospace';
  ctx.fillText('HOCENG VIP • 20/10/2026', 1024, currentY + 285);

  // 10. Call-to-action hint at bottom
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'italic bold 34px "Be Vietnam Pro", sans-serif';
  ctx.fillText('( 🔍 Chạm vào thư để phóng to đọc rõ toàn màn hình )', 1024, currentY + 350);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// 5. 3D Wax Seal Texture (512 x 512)
// ==========================================
function createWaxSealTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
  grad.addColorStop(0, '#ffe082');
  grad.addColorStop(0.5, '#ffb300');
  grad.addColorStop(1, '#c67c00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#fff8e1';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4a0026';
  ctx.font = 'bold 100px sans-serif';
  ctx.fillText('👑', 256, 220);

  ctx.font = 'bold 64px "Playfair Display", serif';
  ctx.fillText('20•10', 256, 315);

  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('VIP', 256, 375);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ==========================================
// Main 3D Greeting Card Component
// ==========================================
export function GreetingCard3D() {
  const groupRef = useRef<THREE.Group>(null);
  const envelopeGroupRef = useRef<THREE.Group>(null);
  const flapPivotRef = useRef<THREE.Group>(null);
  const letterGroupRef = useRef<THREE.Group>(null);
  const heartsGroupRef = useRef<THREE.Group>(null);
  const petalsRef = useRef<THREE.Points>(null);
  const sealMeshRef = useRef<THREE.Mesh>(null);

  const stage = useHandStore((state) => state.stage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);
  const setCardOpened = useHandStore((state) => state.setCardOpened);

  const animProgress = useRef(isCardOpened ? 1 : 0);
  const hasTriggeredFanfare = useRef(false);

  // High-Definition Textures
  const pocketTex = useMemo(() => createEnvelopePocketTexture(), []);
  const flapTex = useMemo(() => createFlapTexture(), []);
  const silkTex = useMemo(() => createSilkLiningTexture(), []);
  const letterTex = useMemo(() => createLetterTexture(), []);
  const sealTex = useMemo(() => createWaxSealTexture(), []);

  useEffect(() => {
    return () => {
      pocketTex.dispose();
      flapTex.dispose();
      silkTex.dispose();
      letterTex.dispose();
      sealTex.dispose();
    };
  }, [pocketTex, flapTex, silkTex, letterTex, sealTex]);

  // Rose Petals & Sparkling Confetti Fountain
  const [petalPositions, petalColors] = useMemo(() => {
    const count = 550;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35 + 4;

      const r = Math.random();
      if (r < 0.45) {
        col[i * 3] = 0.94;
        col[i * 3 + 1] = 0.12;
        col[i * 3 + 2] = 0.45; // Deep Velvet Rose
      } else if (r < 0.8) {
        col[i * 3] = 0.98;
        col[i * 3 + 1] = 0.75;
        col[i * 3 + 2] = 0.1; // 24K Gold
      } else {
        col[i * 3] = 0.88;
        col[i * 3 + 1] = 0.05;
        col[i * 3 + 2] = 0.28; // Crimson
      }
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const isVisible = stage === 'CARD';

    // Master Group visibility transition
    const targetScale = isVisible ? 1 : 0.0001;
    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    if (!isVisible) {
      animProgress.current = 0;
      hasTriggeredFanfare.current = false;
      return;
    }

    const time = clock.getElapsedTime();

    // Smooth Lerp Animation Progress (0 -> 1)
    const targetProgress = isCardOpened ? 1 : 0;
    animProgress.current = THREE.MathUtils.lerp(
      animProgress.current,
      targetProgress,
      0.065
    );
    const p = animProgress.current;

    // Trigger celebration fanfare once when opening crosses threshold
    if (p > 0.4 && !hasTriggeredFanfare.current && isCardOpened) {
      hasTriggeredFanfare.current = true;
      sounds.playCelebrationFanfare();
    } else if (!isCardOpened) {
      hasTriggeredFanfare.current = false;
    }

    // Gentle global float
    groupRef.current.position.y = Math.sin(time * 1.5) * 0.15;

    // ==========================================
    // 1. TOP FLAP ANIMATION: Swings open backwards (0 -> -Math.PI * 0.95)
    // ==========================================
    if (flapPivotRef.current) {
      const flapProgress = THREE.MathUtils.clamp(p * 2.4, 0, 1);
      const flapAngle = THREE.MathUtils.lerp(0, -Math.PI * 0.95, flapProgress);
      flapPivotRef.current.rotation.x = flapAngle;
    }

    // Wax Seal Scale/Burst Effect
    if (sealMeshRef.current) {
      const sealScale = THREE.MathUtils.lerp(1, 0, THREE.MathUtils.clamp(p * 3.5, 0, 1));
      sealMeshRef.current.scale.set(sealScale, sealScale, sealScale);
    }

    // ==========================================
    // 2. ENVELOPE LOWERING: Lowers down and shrinks to clear stage
    // ==========================================
    if (envelopeGroupRef.current) {
      const envLowerProgress = THREE.MathUtils.clamp((p - 0.2) / 0.8, 0, 1);
      const envY = THREE.MathUtils.lerp(0, -7.5, envLowerProgress);
      const envZ = THREE.MathUtils.lerp(0, -4.5, envLowerProgress);
      const envRotX = THREE.MathUtils.lerp(0, -0.22, envLowerProgress);
      const envScale = THREE.MathUtils.lerp(1.0, 0.65, envLowerProgress);

      envelopeGroupRef.current.position.y = envY;
      envelopeGroupRef.current.position.z = envZ;
      envelopeGroupRef.current.rotation.x = envRotX;
      envelopeGroupRef.current.scale.set(envScale, envScale, envScale);
    }

    // ==========================================
    // 3. LETTER EXTRACTION & PRESENTATION (RÚT RA & HIỆN TO RÕ TRƯỚC MÀN HÌNH)
    // ==========================================
    if (letterGroupRef.current) {
      // Phase A: Slides UP out of pocket (p from 0.12 to 0.55)
      const slideUpProgress = THREE.MathUtils.clamp((p - 0.12) / 0.43, 0, 1);
      // Phase B: Glides FORWARD toward camera and centers (p from 0.35 to 1.0)
      const forwardProgress = THREE.MathUtils.clamp((p - 0.35) / 0.65, 0, 1);

      // Y trajectory: starts at -1.0 (inside pocket), rises to 3.5, then settles to 0.3 (center of screen)
      const yUp = THREE.MathUtils.lerp(-1.0, 3.5, slideUpProgress);
      const finalY = THREE.MathUtils.lerp(yUp, 0.3, forwardProgress);

      // Z trajectory: starts at 0.15 (inside pocket), glides forward to 6.5 (right in front of camera)
      const finalZ = THREE.MathUtils.lerp(0.15, 6.5, forwardProgress);

      // Scale: starts at 0.82, expands to 1.0 for huge, readable presentation!
      const finalScale = THREE.MathUtils.lerp(0.82, 1.0, forwardProgress);

      const paperHover = isCardOpened ? Math.sin(time * 1.8) * 0.06 : 0;
      const paperRoll = isCardOpened ? Math.sin(time * 1.2) * 0.005 : 0;

      letterGroupRef.current.position.y = finalY + paperHover;
      letterGroupRef.current.position.z = finalZ;
      letterGroupRef.current.rotation.x = 0; // Perfectly upright: 0 tilt for maximum text clarity
      letterGroupRef.current.rotation.z = paperRoll;
      letterGroupRef.current.scale.set(finalScale, finalScale, finalScale);
    }

    // ==========================================
    // 4. FLOATING 3D RUBY & GOLD HEARTS (Flanking the Letter on Left & Right)
    // ==========================================
    if (heartsGroupRef.current) {
      heartsGroupRef.current.visible = p > 0.3;
      if (p > 0.3) {
        heartsGroupRef.current.children.forEach((child, i) => {
          const isLeft = i < 3;
          const sideSign = isLeft ? -1 : 1;
          const idx = i % 3;
          // Positioned strictly outside letter margins (|x| >= 7.2)
          const baseX = sideSign * (7.2 + idx * 0.85);
          const baseY = 0.3 + (idx - 1) * 3.4 + Math.sin(time * 2.0 + i) * 0.4;
          const baseZ = 6.4 + Math.cos(time * 1.5 + i) * 0.4;

          child.position.set(baseX, baseY, baseZ);
          child.rotation.y = time * 2.2 + i;
          child.rotation.z = Math.sin(time + i) * 0.35;
        });
      }
    }

    // ==========================================
    // 5. ROSE PETAL FOUNTAIN ANIMATION
    // ==========================================
    if (petalsRef.current) {
      const mat = petalsRef.current.material as THREE.PointsMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, isCardOpened ? 0.85 : 0, 0.05);

      if (isCardOpened) {
        const positions = petalsRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.07; // fall down gently
          positions[i] += Math.sin(time + i) * 0.02; // drift horizontally
          if (positions[i + 1] < -20) {
            positions[i + 1] = 20;
          }
        }
        petalsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  // Handle Envelope Click
  const handleEnvelopeClick = (e: any) => {
    e.stopPropagation();
    setCardOpened(!isCardOpened);
    sounds.playChime(1.5);
    if (!isCardOpened) {
      sounds.playWhoosh();
    }
  };

  // Handle Letter Direct Click (Opens Fullscreen Zoom Reader)
  const handleLetterClick = (e: any) => {
    e.stopPropagation();
    if (isCardOpened) {
      sounds.playChime(1.8);
      window.dispatchEvent(new CustomEvent('open-letter-zoom'));
    } else {
      handleEnvelopeClick(e);
    }
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]} visible={stage === 'CARD'}>
      {/* ========================================================= */}
      {/* 3D LUXURY ENVELOPE (Back Plate, Silk Lining, Flap, Pocket) */}
      {/* ========================================================= */}
      <group
        ref={envelopeGroupRef}
        onPointerDown={handleEnvelopeClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Envelope Back Plate (Thick Velvet Board) */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[15.0, 10.0, 0.2]} />
          <meshStandardMaterial
            color="#780036"
            roughness={0.35}
            metalness={0.2}
          />
        </mesh>

        {/* Envelope Inside Silk Damask Lining */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[14.6, 9.6]} />
          <meshBasicMaterial map={silkTex} side={THREE.DoubleSide} />
        </mesh>

        {/* Envelope Front Pocket (Lower half holding the letter) */}
        <mesh position={[0, -1.4, 0.35]}>
          <planeGeometry args={[14.8, 7.2]} />
          <meshBasicMaterial map={pocketTex} side={THREE.DoubleSide} />
        </mesh>

        {/* Top Flap with Hinge Pivot at Top Edge (y = 5.0) */}
        <group ref={flapPivotRef} position={[0, 5.0, 0.38]}>
          {/* Triangular flap with transparent cutout corners */}
          <mesh position={[0, -2.5, 0]}>
            <planeGeometry args={[14.8, 5.0]} />
            <meshStandardMaterial
              map={flapTex}
              side={THREE.DoubleSide}
              transparent={true}
              alphaTest={0.05}
              roughness={0.3}
              metalness={0.15}
            />
          </mesh>

          {/* 3D Embossed Golden Wax Seal at Flap Tip */}
          <mesh
            ref={sealMeshRef}
            position={[0, -4.5, 0.15]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[1.1, 1.1, 0.2, 32]} />
            <meshStandardMaterial
              map={sealTex}
              color="#ffd700"
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* THE 3D GREETING LETTER (Slides out, Zooms Forward & Expands) */}
      {/* ========================================================= */}
      <group
        ref={letterGroupRef}
        position={[0, -1.0, 0.15]}
        onPointerDown={handleLetterClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* High-Definition Deckle-Edge Letter Mesh - Huge 11.2 x 14.0 (84% Screen Height) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[11.2, 14.0, 0.08]} />
          <meshBasicMaterial map={letterTex} side={THREE.DoubleSide} />
        </mesh>

        {/* Golden Foil Edge Border Around Letter */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[11.4, 14.2, 0.06]} />
          <meshStandardMaterial
            color="#ffd700"
            metalness={0.92}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3D FLOATING RUBY & GOLD JEWEL HEARTS */}
      {/* ========================================================= */}
      <group ref={heartsGroupRef} visible={false}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <octahedronGeometry args={[0.7]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#d81b60' : '#ffd700'}
              metalness={0.85}
              roughness={0.2}
              emissive={i % 2 === 0 ? '#ff1744' : '#ffb300'}
              emissiveIntensity={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================= */}
      {/* ROSE PETAL & CELEBRATION SPARKS FOUNTAIN */}
      {/* ========================================================= */}
      <points ref={petalsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[petalPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[petalColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.48}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { HandController } from './components/HandController';
import { initHandTracking } from './services/HandTrackingService';
import { sounds } from './services/SoundService';
import { useHandStore, PERSON_PROFILES } from './store';
import type { PresentationStage } from './store';
import { OrientationGuard } from './components/OrientationGuard';
import './index.css';

// ==========================================
// 1. Confetti & Flower Petal Particle Engine
// ==========================================
interface ConfettiParticle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  color: string;
  shape: 'rect' | 'circle' | 'petal';
}

function ConfettiOverlay({ triggerBurst }: { triggerBurst: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<ConfettiParticle[]>([]);
  const animId = useRef<number | null>(null);

  const addBurst = useCallback((count = 140) => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const colors = ['#e91e63', '#ff4081', '#ffd700', '#ff80ab', '#ffffff', '#ff1744', '#ffe57f', '#00e676'];

    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() > 0.5;
      particles.current.push({
        x: isLeft ? w * 0.2 + (Math.random() - 0.5) * 120 : w * 0.8 + (Math.random() - 0.5) * 120,
        y: h * 0.35 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14 + (isLeft ? 4 : -4),
        vy: -9 - Math.random() * 12,
        w: 9 + Math.random() * 9,
        h: 7 + Math.random() * 11,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.22,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.4 ? 'petal' : Math.random() > 0.5 ? 'circle' : 'rect',
      });
    }
  }, []);

  useEffect(() => {
    if (triggerBurst > 0) {
      addBurst(160);
    }
  }, [triggerBurst, addBurst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.vx *= 0.985;
        p.rot += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.7, p.h * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();

        if (p.y > canvas.height + 50) {
          particles.current.splice(i, 1);
        }
      }

      animId.current = requestAnimationFrame(render);
    };

    animId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId.current) cancelAnimationFrame(animId.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 170,
      }}
    />
  );
}

// ==========================================
// 2. Sound & BGM Toggle Control (Light Theme)
// ==========================================
function SoundControlButton() {
  const [soundEnabled, setSoundEnabled] = useState(sounds.enabled);
  const [bgmActive, setBgmActive] = useState(sounds.bgmPlaying);

  const toggleSound = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
    if (next) sounds.playChime(1.2);
  };

  const toggleBgm = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = sounds.toggleBGM();
    setBgmActive(next);
    if (next) setSoundEnabled(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '180px',
        zIndex: 160,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <button
        onClick={toggleSound}
        title={soundEnabled ? 'Tắt hiệu ứng âm thanh' : 'Bật hiệu ứng âm thanh'}
        style={{
          padding: '9px 15px',
          background: soundEnabled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
          border: soundEnabled ? '1.5px solid #e91e63' : '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '30px',
          color: soundEnabled ? '#c2185b' : '#777',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          boxShadow: soundEnabled ? '0 4px 16px rgba(233, 30, 99, 0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{soundEnabled ? '🔊' : '🔇'}</span>
        <span>{soundEnabled ? 'Âm thanh' : 'Tắt âm'}</span>
      </button>

      <button
        onClick={toggleBgm}
        title={bgmActive ? 'Tắt nhạc nền' : 'Bật nhạc nền du dương'}
        style={{
          padding: '9px 15px',
          background: bgmActive ? 'linear-gradient(135deg, #fff0f5 0%, #ffebee 100%)' : 'rgba(255, 255, 255, 0.8)',
          border: bgmActive ? '1.5px solid #d81b60' : '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '30px',
          color: bgmActive ? '#ad1457' : '#777',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(16px)',
          boxShadow: bgmActive ? '0 4px 18px rgba(216, 27, 96, 0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
        }}
      >
        <span>{bgmActive ? '🎵' : '🎼'}</span>
        <span>{bgmActive ? 'Đang phát nhạc' : 'Nhạc nền'}</span>
      </button>
    </div>
  );
}

// ==========================================
// 3. Fullscreen Button (Light Theme)
// ==========================================
function FullscreenButton() {
  const isFullscreen = useHandStore((state) => state.isFullscreen);
  const toggleFullscreen = useHandStore((state) => state.toggleFullscreen);

  return (
    <button
      onClick={toggleFullscreen}
      title="Bật/Tắt toàn màn hình (Phím F)"
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 160,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 18px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1.5px solid #ffd700',
        borderRadius: '30px',
        color: '#880e4f',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(233, 30, 99, 0.2), 0 0 10px rgba(255, 215, 0, 0.3)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ fontSize: '15px' }}>{isFullscreen ? '✕' : '⛶'}</span>
      <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
      <span style={{ fontSize: '10px', opacity: 0.7, padding: '1px 5px', background: 'rgba(233, 30, 99, 0.1)', borderRadius: '4px', color: '#c2185b' }}>F</span>
    </button>
  );
}

// ==========================================
// 4. Welcome Landing Overlay (Mới vào có chữ Bắt Đầu)
// ==========================================
function WelcomeLandingOverlay() {
  const hasStarted = useHandStore((state) => state.hasStarted);
  const showGestureModal = useHandStore((state) => state.showGestureModal);
  const openGestureModal = useHandStore((state) => state.openGestureModal);

  if (hasStarted || showGestureModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 240, 245, 0.75)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          border: '2px solid #ffd700',
          borderRadius: '32px',
          padding: '40px 48px',
          boxShadow: '0 20px 60px rgba(216, 27, 96, 0.25), 0 0 40px rgba(255, 215, 0, 0.3)',
          textAlign: 'center',
          maxWidth: '640px',
          width: '90%',
          animation: 'floatGentle 4s infinite ease-in-out',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🌸 💖 👑 💖 🌸</div>
        <div style={{ fontSize: '13px', fontWeight: '800', color: '#c2185b', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
          20 THÁNG 10 • NGÀY PHỤ NỮ VIỆT NAM
        </div>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '34px',
            fontWeight: '900',
            color: '#880e4f',
            margin: '0 0 14px 0',
            textShadow: '0 2px 10px rgba(216, 27, 96, 0.15)',
          }}
        >
          ĐẠI TIỆC TÔN VINH PHÁI ĐẸP
        </h1>
        <p
          style={{
            fontSize: '15.5px',
            color: '#455a64',
            lineHeight: '1.65',
            margin: '0 0 28px 0',
          }}
        >
          Chào mừng quý vị đến với hệ thống trình diễn <b>Kiếm Khí Vũ Trụ & Triển Lãm 9 Mỹ Nhân</b> tương tác không chạm bằng công nghệ AI nhận diện cử chỉ bàn tay.
        </p>

        <button
          onClick={() => {
            sounds.playChime(1.2);
            openGestureModal();
          }}
          style={{
            padding: '18px 48px',
            borderRadius: '40px',
            background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 50%, #880e4f 100%)',
            border: '2px solid #ffd700',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '1px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(216, 27, 96, 0.5), 0 0 20px #ffd700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulseGold 2s infinite ease-in-out',
            transition: 'transform 0.2s',
          }}
        >
          <span style={{ fontSize: '24px' }}>🌟</span>
          <span>BẮT ĐẦU BUỔI LỄ</span>
          <span style={{ fontSize: '20px' }}>▶</span>
        </button>

        <div style={{ marginTop: '16px', fontSize: '12px', color: '#880e4f', opacity: 0.8 }}>
          Nhấn BẮT ĐẦU để xem danh sách cử chỉ và khởi động camera AI
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. Gesture List Modal (Danh sách ký hiệu nhấn OK mới bắt đầu)
// ==========================================
function GestureListModal({ onConfirmStart }: { onConfirmStart: () => void }) {
  const showGestureModal = useHandStore((state) => state.showGestureModal);

  if (!showGestureModal) return null;

  const gestures = [
    {
      step: 'Bước 1',
      icon: '✊',
      name: 'Nắm Đấm Bàn Tay',
      desc: 'Tạo quả cầu kiếm bảo vệ',
      detail: 'Thu gom các thanh kiếm vào bên trong một quả cầu năng lượng xoay tròn.',
    },
    {
      step: 'Bước 2',
      icon: '🖐️',
      name: 'Mở 5 Ngón Tay',
      desc: 'Mở triển lãm 9 mỹ nhân',
      detail: 'Bung tỏa không gian 3D hiển thị 9 bức ảnh xếp thành hình cung lộng lẫy.',
    },
    {
      step: 'Bước 3',
      icon: '☝️',
      name: 'Lướt 1 Ngón Qua Trái',
      desc: 'Xem người tiếp theo (1->9)',
      detail: 'Chỉ cần giơ 1 ngón trỏ lướt nhẹ sang trái. Ảnh phóng to bên trái, thông tin VIP to bên phải!',
    },
    {
      step: 'Bước 4',
      icon: '🔒',
      name: 'Chống Nhiễu Tín Hiệu',
      desc: 'Giơ 2 ngón (giữa + út) khóa',
      detail: 'Khóa cảm biến khi có người lạ quơ tay. Giơ 3 ngón (trỏ + giữa + út) để Mở Khóa.',
    },
    {
      step: 'Bước 5',
      icon: '✌️',
      name: 'Giơ 2 Ngón Chữ V',
      desc: 'Hiện thiệp 20/10 hoàng gia',
      detail: 'Cử chỉ chữ V (hoặc lướt hết 9 ảnh) sẽ tự động triệu hồi chiếc thiệp mừng dát vàng.',
    },
    {
      step: 'Bước 6',
      icon: '👏',
      name: 'Chụp 2 Bàn Tay',
      desc: 'Lá thư 3D rút bay ra & hiện to rõ',
      detail: 'Chụp / vỗ 2 bàn tay lại: phong bì mở nắp, lá thư 3D tự động rút bay ra và phóng to trước màn hình cùng pháo hoa & hoa hồng!',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 210,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 240, 245, 0.85)',
        backdropFilter: 'blur(22px)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          border: '2px solid #ffd700',
          borderRadius: '32px',
          padding: '32px 36px',
          boxShadow: '0 20px 60px rgba(216, 27, 96, 0.25), 0 0 35px rgba(255, 215, 0, 0.3)',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#c2185b', letterSpacing: '1px' }}>
            HƯỚNG DẪN ĐIỀU KHIỂN SÂN KHẤU
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '28px',
              fontWeight: '900',
              color: '#880e4f',
              margin: '4px 0 6px 0',
            }}
          >
            👑 DANH SÁCH 6 CỬ CHỈ BIỂU DIỄN 👑
          </h2>
          <p style={{ fontSize: '14px', color: '#546e7a', margin: 0 }}>
            Vui lòng xem qua các cử chỉ dưới đây. Nhấn nút <b>OK</b> bên dưới để chính thức bắt đầu nhận diện:
          </p>
        </div>

        {/* Gestures Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '14px',
            overflowY: 'auto',
            paddingRight: '6px',
            marginBottom: '24px',
          }}
        >
          {gestures.map((g) => (
            <div
              key={g.step}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fff4f7 100%)',
                border: '1.5px solid rgba(233, 30, 99, 0.25)',
                borderRadius: '20px',
                padding: '14px 16px',
                boxShadow: '0 4px 15px rgba(216, 27, 96, 0.08)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ff4081 0%, #c2185b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(233, 30, 99, 0.35)',
                  border: '1px solid #ffd700',
                }}
              >
                {g.icon}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: '#c2185b', background: 'rgba(233, 30, 99, 0.1)', padding: '1px 6px', borderRadius: '6px' }}>
                    {g.step}
                  </span>
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#263238' }}>
                    {g.name}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#d81b60', marginTop: '2px' }}>
                  {g.desc}
                </div>
                <div style={{ fontSize: '11px', color: '#607d8b', marginTop: '3px', lineHeight: '1.35' }}>
                  {g.detail}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shortcuts Note */}
        <div
          style={{
            background: 'rgba(255, 248, 225, 0.9)',
            border: '1px solid #ffe082',
            borderRadius: '14px',
            padding: '10px 16px',
            fontSize: '11.5px',
            color: '#6d4c41',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '16px' }}>💡</span>
          <span>
            <b>Phím tắt MC/Người thuyết trình:</b> Phím <b>1</b> (Cầu kiếm), <b>2</b> (9 Ảnh), <b>3/C</b> (Thiệp), <b>Space</b> (Mở thiệp), <b>Mũi tên ← / →</b> (Lướt ảnh), <b>L</b> (Khóa), <b>F</b> (Toàn màn hình).
          </span>
        </div>

        {/* Big OK Start Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onConfirmStart}
            style={{
              padding: '16px 54px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 50%, #880e4f 100%)',
              border: '2px solid #ffd700',
              color: '#ffffff',
              fontSize: '17px',
              fontWeight: '900',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(216, 27, 96, 0.5), 0 0 20px #ffd700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'pulseGold 2s infinite ease-in-out',
            }}
          >
            <span>✨ TÔI ĐÃ HIỂU & BẮT ĐẦU (OK) ✨</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. Realtime Gesture Guide (Light Theme Sidebar)
// ==========================================
function RealtimeGestureGuide({ hasCamera }: { hasCamera: boolean }) {
  const liveGestureLabel = useHandStore((state) => state.liveGestureLabel);
  const liveGestureDesc = useHandStore((state) => state.liveGestureDesc);
  const stage = useHandStore((state) => state.stage);
  const isLocked = useHandStore((state) => state.isLocked);
  const activeStep = useHandStore((state) => state.activeStep);
  const guideCollapsed = useHandStore((state) => state.guideCollapsed);
  const toggleGuide = useHandStore((state) => state.toggleGuide);
  const toggleLock = useHandStore((state) => state.toggleLock);
  const setStage = useHandStore((state) => state.setStage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);

  const steps = [
    {
      num: 1,
      icon: '✊',
      name: 'Nắm đấm',
      desc: 'Tạo quả cầu kiếm hộ thể',
      isCurrent: stage === 'FIST_ORB',
      onClick: () => {
        setStage('FIST_ORB');
        sounds.playOrbHum();
      },
    },
    {
      num: 2,
      icon: '🖐️',
      name: 'Mở 5 ngón',
      desc: 'Hiện triển lãm 9 ảnh mỹ nhân',
      isCurrent: stage === 'GALLERY' && activeStep <= 2,
      onClick: () => {
        setStage('GALLERY');
        sounds.playWhoosh();
      },
    },
    {
      num: 3,
      icon: '☝️',
      name: 'Lướt 1 ngón qua trái',
      desc: 'Chỉ 1 ngón trỏ dơ sang trái (1->9)',
      isCurrent: stage === 'GALLERY' && activeStep >= 3,
      onClick: () => {
        useHandStore.getState().nextPhoto();
        sounds.playChime();
        sounds.playWhoosh();
      },
    },
    {
      num: 4,
      icon: isLocked ? '🔒' : '🟢',
      name: isLocked ? 'Đã khóa chống nhiễu' : 'Chống nhiễu tín hiệu',
      desc: isLocked ? 'Giơ 3 ngón (+ trỏ) mở khóa' : 'Giơ 2 ngón (giữa + út) để khóa',
      isCurrent: isLocked,
      isSpecial: true,
      onClick: () => toggleLock(),
    },
    {
      num: 5,
      icon: '✌️',
      name: 'Hiện thiệp 20/10',
      desc: 'Giơ 2 ngón chữ V (✌️) hoặc lướt hết 9 ảnh',
      isCurrent: stage === 'CARD' && !isCardOpened,
      onClick: () => {
        setStage('CARD');
        sounds.playChime(1.5);
      },
    },
    {
      num: 6,
      icon: '👏',
      name: 'Chụp 2 bàn tay',
      desc: 'Lá thư 3D rút bay ra & hiện to rõ',
      isCurrent: stage === 'CARD' && isCardOpened,
      onClick: () => {
        setStage('CARD');
        useHandStore.getState().setCardOpened(true);
        sounds.playCelebrationFanfare();
      },
    },
  ];

  const currentStepNum = isLocked ? 4 : isCardOpened ? 6 : stage === 'CARD' ? 5 : stage === 'GALLERY' ? 3 : stage === 'FIST_ORB' ? 1 : 1;
  const progressPercent = Math.min(100, Math.round((currentStepNum / 6) * 100));

  return (
    <div
      className="guide-panel"
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 150,
        width: guideCollapsed ? 'auto' : '320px',
        maxHeight: 'calc(100vh - 100px)',
        background: 'rgba(255, 255, 255, 0.94)',
        border: '1.5px solid rgba(233, 30, 99, 0.35)',
        borderRadius: '24px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 40px rgba(216, 27, 96, 0.15), 0 0 20px rgba(255, 215, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(255, 240, 245, 0.9) 0%, rgba(255, 228, 235, 0.9) 100%)',
          borderBottom: '1px solid rgba(233, 30, 99, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🌸</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#880e4f', letterSpacing: '0.5px' }}>
              HƯỚNG DẪN CỬ CHỈ 20/10
            </div>
            {!guideCollapsed && (
              <div style={{ fontSize: '10px', color: '#c2185b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e676', display: 'inline-block' }} />
                <span>Trực tiếp thời gian thực</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleGuide}
          title={guideCollapsed ? 'Mở rộng hướng dẫn' : 'Thu gọn hướng dẫn'}
          style={{
            background: 'rgba(233, 30, 99, 0.1)',
            border: 'none',
            color: '#ad1457',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '5px 12px',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          {guideCollapsed ? 'Mở rộng ▾' : 'Thu gọn ▴'}
        </button>
      </div>

      {!guideCollapsed && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          {/* Progress Bar */}
          <div style={{ background: 'rgba(233, 30, 99, 0.06)', borderRadius: '12px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#880e4f', fontWeight: 'bold' }}>
              <span>Tiến độ biểu diễn</span>
              <span>{currentStepNum} / 6 bước</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(0, 0, 0, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #ff4081, #d81b60, #ffd700)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 8px rgba(216, 27, 96, 0.5)',
                }}
              />
            </div>
          </div>

          {/* Live Detected Gesture Monitor Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '18px',
              background: isLocked
                ? 'rgba(255, 68, 102, 0.15)'
                : 'linear-gradient(135deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 228, 235, 0.95) 100%)',
              border: isLocked ? '1.5px solid #ff4466' : '1.5px solid rgba(233, 30, 99, 0.4)',
              boxShadow: '0 4px 15px rgba(216, 27, 96, 0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: isLocked ? '#ff4466' : '#c2185b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLocked ? '#ff4466' : '#00e676', display: 'inline-block' }} />
                <span>CỬ CHỈ ĐANG PHÁT HIỆN</span>
              </span>
              <span style={{ fontSize: '10px', opacity: 0.8, color: '#880e4f', fontWeight: 'bold' }}>
                {hasCamera ? 'AI Camera 60FPS' : 'Chuột / Cảm ứng'}
              </span>
            </div>

            <div style={{ fontSize: '16px', fontWeight: '800', color: '#2b0b1c', margin: '4px 0 2px 0' }}>
              {liveGestureLabel}
            </div>

            <div style={{ fontSize: '11px', color: '#546e7a' }}>
              {liveGestureDesc}
            </div>
          </div>

          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {steps.map((st) => (
              <div
                key={st.num}
                onClick={st.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  background: st.isCurrent
                    ? 'linear-gradient(135deg, rgba(255, 64, 129, 0.15) 0%, rgba(255, 215, 0, 0.18) 100%)'
                    : 'rgba(0, 0, 0, 0.02)',
                  border: st.isCurrent
                    ? '1.5px solid #d81b60'
                    : '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: st.isCurrent ? '0 4px 16px rgba(216, 27, 96, 0.25)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: st.isCurrent
                      ? 'linear-gradient(135deg, #ff4081 0%, #c2185b 100%)'
                      : 'rgba(233, 30, 99, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    boxShadow: st.isCurrent ? '0 2px 10px rgba(216, 27, 96, 0.4)' : 'none',
                    color: st.isCurrent ? '#fff' : '#880e4f',
                  }}
                >
                  {st.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: st.isCurrent ? '#880e4f' : '#263238' }}>
                      Bước {st.num}: {st.name}
                    </span>
                    {st.isCurrent && (
                      <span style={{ fontSize: '9.5px', color: '#c2185b', fontWeight: 'bold' }}>
                        ● Đang chọn
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#78909c', marginTop: '1px' }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. VIP Persona Showcase (Ảnh phóng to bên trái, tên & mô tả to bên phải)
// ==========================================
function VipPersonaShowcase({ onCelebrate }: { onCelebrate: () => void }) {
  const stage = useHandStore((state) => state.stage);
  const currentPhotoIndex = useHandStore((state) => state.currentPhotoIndex);
  const nextPhoto = useHandStore((state) => state.nextPhoto);
  const prevPhoto = useHandStore((state) => state.prevPhoto);
  const setPhotoIndex = useHandStore((state) => state.setPhotoIndex);
  const setStage = useHandStore((state) => state.setStage);

  if (stage !== 'GALLERY') return null;

  const current = PERSON_PROFILES[currentPhotoIndex];

  const handleNext = () => {
    nextPhoto();
    sounds.playChime();
    sounds.playWhoosh();
  };

  const handlePrev = () => {
    prevPhoto();
    sounds.playChime(0.9);
    sounds.playWhoosh();
  };

  const handleSelect = (idx: number) => {
    setPhotoIndex(idx);
    sounds.playChime(1.0 + idx * 0.08);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        width: '92%',
        maxWidth: '860px',
        pointerEvents: 'auto',
      }}
    >
      {/* Executive VIP Split Card (Ảnh to bên trái, Mô tả & Tên to bên phải) */}
      <div
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.97)',
          border: '2.5px solid #ffd700',
          borderRadius: '32px',
          padding: '24px 30px',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 25px 70px rgba(216, 27, 96, 0.22), 0 0 40px rgba(255, 215, 0, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* BÊN TRÁI: ẢNH PHÓNG TO TRANG TRỌNG (Grand Gold Framed Portrait) */}
        <div
          style={{
            width: '260px',
            height: '330px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #ffffff 0%, #fff0f5 50%, #ffe4ec 100%)',
            border: '3.5px solid #ffd700',
            boxShadow: '0 12px 36px rgba(216, 27, 96, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Crown Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
              padding: '4px 14px',
              borderRadius: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.18)',
              border: '1.5px solid #fff',
            }}
          >
            <span style={{ fontSize: '14px' }}>👑</span>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#4a0026', letterSpacing: '0.5px' }}>
              ẢNH {current.id} / 9
            </span>
          </div>

          {/* Central Portrait Emblem */}
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff4081 50%, #e91e63 100%)',
              padding: '4px',
              boxShadow: '0 8px 24px rgba(233, 30, 99, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '18px 0 10px 0',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '62px',
              }}
            >
              👸🏻
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              fontWeight: '900',
              color: '#880e4f',
              letterSpacing: '0.5px',
            }}
          >
            {current.label}
          </div>

          <div style={{ fontSize: '11.5px', color: '#c2185b', fontWeight: 'bold', marginTop: '2px', letterSpacing: '0.5px' }}>
            ✨ NỮ THẦN TỎA SÁNG ✨
          </div>

          {/* Bottom Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1.5px solid #ff80ab',
              padding: '4px 16px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#ad1457',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            ★ 20 • 10 • 2026 ★
          </div>
        </div>

        {/* BÊN PHẢI: TÊN VÀ MÔ TẢ TO LÊN CHUYÊN NGHIỆP & VIP */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Chức Danh / Danh Hiệu VIP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: '900',
                color: '#fff',
                background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                padding: '5px 16px',
                borderRadius: '18px',
                boxShadow: '0 3px 12px rgba(216, 27, 96, 0.35)',
                border: '1.5px solid #ffd700',
              }}
            >
              👑 {current.role}
            </span>
            <span style={{ fontSize: '13px', color: '#ffb300', fontWeight: 'bold' }}>
              ★★★★★
            </span>
          </div>

          {/* HỌ VÀ TÊN RẤT TO, SANG TRỌNG */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '38px',
              fontWeight: '900',
              color: '#880e4f',
              margin: '0 0 10px 0',
              lineHeight: '1.2',
              textShadow: '0 2px 8px rgba(216, 27, 96, 0.1)',
            }}
          >
            {current.name}
          </h1>

          {/* LỜI CHÚC TRÂN QUÝ (Khổ to, trang trọng) */}
          <div
            style={{
              fontSize: '16px',
              color: '#37474f',
              lineHeight: '1.7',
              fontStyle: 'italic',
              background: 'rgba(255, 240, 245, 0.85)',
              padding: '14px 20px',
              borderRadius: '20px',
              borderLeft: '5px solid #d81b60',
              marginBottom: '16px',
            }}
          >
            “{current.wish}”
          </div>

          {/* Quick Actions for this person */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onCelebrate}
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                border: 'none',
                color: '#4a0026',
                borderRadius: '16px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 3px 12px rgba(255, 215, 0, 0.4)',
              }}
            >
              <span>🌸 Tung Hoa Chúc Mừng</span>
            </button>

            <button
              onClick={() => {
                setStage('CARD');
                sounds.playChime(1.5);
              }}
              style={{
                background: 'rgba(233, 30, 99, 0.1)',
                border: '1px solid #d81b60',
                color: '#880e4f',
                borderRadius: '16px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ✉️ Mở Thiệp 20/10
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Light Theme) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.96)',
          padding: '6px 16px',
          borderRadius: '30px',
          border: '1.5px solid rgba(233, 30, 99, 0.25)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 30px rgba(216, 27, 96, 0.15)',
        }}
      >
        <button
          onClick={handlePrev}
          title="Người trước đó"
          style={{
            background: 'rgba(233, 30, 99, 0.08)',
            border: 'none',
            color: '#880e4f',
            borderRadius: '16px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ◀ Trước
        </button>

        <div style={{ display: 'flex', gap: '5px' }}>
          {PERSON_PROFILES.map((p, idx) => {
            const isSelected = idx === currentPhotoIndex;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(idx)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #ffd700' : 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)'
                    : 'rgba(0, 0, 0, 0.06)',
                  color: isSelected ? '#fff' : '#555',
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 12px rgba(216, 27, 96, 0.6)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {p.id}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          title="Người tiếp theo"
          style={{
            background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
            border: 'none',
            color: '#fff',
            borderRadius: '16px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(216, 27, 96, 0.35)',
          }}
        >
          <span>Sau</span>
          <span>▶</span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 8. Card Celebration Modal (Light Theme)
// ==========================================
function CardCelebrationModal({ onCelebrate }: { onCelebrate: () => void }) {
  const stage = useHandStore((state) => state.stage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);
  const setCardOpened = useHandStore((state) => state.setCardOpened);
  const setStage = useHandStore((state) => state.setStage);
  const setGuideCollapsed = useHandStore((state) => state.setGuideCollapsed);
  const [copied, setCopied] = useState(false);
  const [showZoomReader, setShowZoomReader] = useState(false);

  useEffect(() => {
    if (isCardOpened) {
      setGuideCollapsed(true);
    }
  }, [isCardOpened, setGuideCollapsed]);

  useEffect(() => {
    const handleOpenZoom = () => {
      setShowZoomReader(true);
    };
    window.addEventListener('open-letter-zoom', handleOpenZoom);
    return () => window.removeEventListener('open-letter-zoom', handleOpenZoom);
  }, []);

  if (stage !== 'CARD') return null;

  const wishContent = `🌸 THƯ CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10 🌸
Kính gửi toàn thể một nửa thế giới thân yêu!

Nhân ngày Phụ Nữ Việt Nam 20/10, xin trân trọng kính chúc toàn thể các chị, các em:
🌸 Luôn tươi vui, rạng ngời như những đóa hoa sớm mai,
💖 Nụ cười tỏa nắng, tâm hồn an yên và đong đầy hạnh phúc,
✨ Luôn tự tin, bản lĩnh gặt hái ngàn thành công rực rỡ,
🌹 Và mãi mãi được yêu thương, nâng niu trọn vẹn từng khoảnh khắc!

💖 Thân tặng những người phụ nữ tuyệt vời nhất! 💖
HOCENG VIP • 20/10/2026`;

  const copyWish = () => {
    navigator.clipboard.writeText(wishContent);
    setCopied(true);
    sounds.playChime(1.4);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenCard = () => {
    setCardOpened(true);
    sounds.playCelebrationFanfare();
    onCelebrate();
  };

  return (
    <>
      {/* 1. Thanh điều khiển nổi phía dưới (Không che khuất không gian 3D) */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 140,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        {!isCardOpened ? (
          <button
            onClick={handleOpenCard}
            style={{
              padding: '16px 44px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 50%, #880e4f 100%)',
              border: '2px solid #ffd700',
              color: '#ffffff',
              fontSize: '17px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(216, 27, 96, 0.75), 0 0 20px #ffd700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'pulseGold 2s infinite ease-in-out',
            }}
          >
            <span style={{ fontSize: '24px' }}>👏</span>
            <span>Chụp 2 bàn tay hoặc Click để RÚT LÁ THƯ RA!</span>
            <span style={{ fontSize: '11px', opacity: 0.9, padding: '3px 10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>[Space]</span>
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.96)',
              padding: '10px 22px',
              borderRadius: '36px',
              border: '2px solid #ffd700',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 15px 45px rgba(216, 27, 96, 0.25), 0 0 25px rgba(255, 215, 0, 0.35)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              animation: 'floatGentle 4s infinite ease-in-out',
            }}
          >
            <button
              onClick={() => {
                setShowZoomReader(!showZoomReader);
                sounds.playChime(1.3);
              }}
              title="Phóng to nội dung thư dạng trang trọng dễ đọc nhất"
              style={{
                padding: '9px 20px',
                borderRadius: '24px',
                background: showZoomReader ? 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)' : 'rgba(216, 27, 96, 0.1)',
                border: '1.5px solid #d81b60',
                color: showZoomReader ? '#ffffff' : '#880e4f',
                fontSize: '13.5px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: showZoomReader ? '0 4px 14px rgba(216, 27, 96, 0.4)' : 'none',
              }}
            >
              <span>{showZoomReader ? '✕ Thu Nhỏ Thư' : '🔍 Phóng To Đọc Rõ'}</span>
            </button>

            <button
              onClick={() => {
                onCelebrate();
                sounds.playCelebrationFanfare();
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                border: 'none',
                color: '#4a0026',
                fontSize: '13.5px',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🎆 Tung Pháo Hoa</span>
            </button>

            <button
              onClick={copyWish}
              style={{
                padding: '9px 18px',
                borderRadius: '24px',
                background: copied ? 'rgba(0, 230, 118, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                border: copied ? '1.5px solid #00e676' : '1px solid rgba(0, 0, 0, 0.15)',
                color: copied ? '#00c853' : '#455a64',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{copied ? '✓ Đã sao chép!' : '📋 Sao Chép Lời Chúc'}</span>
            </button>

            <button
              onClick={() => {
                setCardOpened(false);
                setShowZoomReader(false);
                sounds.playWhoosh();
              }}
              title="Đóng nắp phong bì để biểu diễn lại"
              style={{
                padding: '9px 18px',
                borderRadius: '24px',
                background: 'rgba(233, 30, 99, 0.08)',
                border: '1px solid #d81b60',
                color: '#880e4f',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🔄 Thu Lại Vào Phong Bì</span>
            </button>

            <button
              onClick={() => {
                setStage('GALLERY');
                setShowZoomReader(false);
                sounds.playWhoosh();
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(216, 27, 96, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🌸 Về 9 Mỹ Nhân</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Chế độ Phóng To Đọc Rõ Toàn Màn Hình (Chữ Cực Lớn, Sang Trọng, Sắc Nét 100%) */}
      {isCardOpened && showZoomReader && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 240, 245, 0.7)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
          }}
          onClick={() => setShowZoomReader(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fff9fa 50%, #fcedf2 100%)',
              border: '3px solid #ffd700',
              borderRadius: '36px',
              padding: '40px 48px',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(216, 27, 96, 0.3), 0 0 50px rgba(255, 215, 0, 0.45)',
              textAlign: 'center',
              position: 'relative',
              animation: 'pulseGlow 4s infinite ease-in-out',
            }}
          >
            {/* Nút đóng */}
            <button
              onClick={() => setShowZoomReader(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'rgba(216, 27, 96, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#880e4f',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌸 💖 👑 💖 🌸</div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#c2185b', letterSpacing: '1px', marginBottom: '6px' }}>
              ✨ ĐẠI TIỆC TÔN VINH PHÁI ĐẸP 20/10 ✨
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#880e4f',
                fontSize: '34px',
                fontWeight: '900',
                margin: '0 0 6px 0',
              }}
            >
              THƯ CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM
            </h1>
            <div style={{ color: '#d81b60', fontSize: '18px', fontStyle: 'italic', fontWeight: 'bold', marginBottom: '16px' }}>
              ✦ 20 THÁNG 10 • HAPPY WOMEN'S DAY ✦
            </div>

            <div style={{ width: '180px', height: '3px', background: 'linear-gradient(90deg, transparent, #ffd700, transparent)', margin: '0 auto 20px auto' }} />

            <div
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                color: '#1a000d',
                fontSize: '20px',
                lineHeight: '1.85',
                background: 'rgba(255, 255, 255, 0.85)',
                padding: '24px 30px',
                borderRadius: '24px',
                border: '1.5px solid rgba(255, 215, 0, 0.6)',
                marginBottom: '24px',
                textAlign: 'left',
                boxShadow: 'inset 0 0 15px rgba(255, 240, 245, 0.5)',
              }}
            >
              <p style={{ fontWeight: 'bold', fontSize: '22px', color: '#880e4f', marginBottom: '14px' }}>
                Kính gửi toàn thể một nửa thế giới thân yêu!
              </p>
              <p style={{ marginBottom: '12px' }}>
                Nhân ngày Phụ Nữ Việt Nam 20/10, xin trân trọng kính chúc toàn thể các chị, các em:
              </p>
              <p style={{ marginBottom: '10px', paddingLeft: '8px' }}>
                🌸 <strong>Luôn tươi vui, rạng ngời</strong> như những đóa hoa ngát hương sớm mai.
              </p>
              <p style={{ marginBottom: '10px', paddingLeft: '8px' }}>
                💖 <strong>Nụ cười luôn tỏa nắng</strong>, tâm hồn bình an và đong đầy hạnh phúc yêu thương.
              </p>
              <p style={{ marginBottom: '10px', paddingLeft: '8px' }}>
                ✨ <strong>Luôn tự tin, bản lĩnh</strong> và gặt hái được ngàn thành công rực rỡ trong sự nghiệp.
              </p>
              <p style={{ marginBottom: '14px', paddingLeft: '8px' }}>
                🌹 Và mãi mãi là <strong>nguồn cảm hứng diệu kỳ</strong>, được trân quý nâng niu trong từng phút giây!
              </p>
              <p style={{ fontStyle: 'italic', color: '#c2185b', textAlign: 'right', marginTop: '16px', fontWeight: 'bold' }}>
                💖 Thân tặng những người phụ nữ tuyệt vời nhất! 💖
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  onCelebrate();
                  sounds.playCelebrationFanfare();
                }}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                  border: 'none',
                  color: '#4a0026',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(255, 215, 0, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>🎆 Bắn Thêm Pháo Hoa</span>
              </button>

              <button
                onClick={copyWish}
                style={{
                  padding: '12px 26px',
                  borderRadius: '30px',
                  background: copied ? 'rgba(0, 230, 118, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                  border: copied ? '2px solid #00e676' : '1px solid rgba(0, 0, 0, 0.15)',
                  color: copied ? '#00c853' : '#37474f',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{copied ? '✓ Đã sao chép vào clipboard!' : '📋 Sao Chép Lời Chúc'}</span>
              </button>

              <button
                onClick={() => setShowZoomReader(false)}
                style={{
                  padding: '12px 26px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(216, 27, 96, 0.35)',
                }}
              >
                <span>✕ Thu Nhỏ (Xem Thiệp 3D)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 9. Bottom Stage Selector (Light Theme)
// ==========================================
function BottomStageSelector() {
  const currentStage = useHandStore((state) => state.stage);
  const setStage = useHandStore((state) => state.setStage);

  const stages: { stage: PresentationStage; name: string; key: string }[] = [
    { stage: 'IDLE', name: '⚔️ Kiếm Trận', key: '0' },
    { stage: 'FIST_ORB', name: '✊ Quả Cầu Kiếm', key: '1' },
    { stage: 'GALLERY', name: '🖐️ 9 Ảnh Mỹ Nhân', key: '2' },
    { stage: 'CARD', name: '✉️ Thiệp 20/10', key: '3' },
  ];

  const handleStageClick = (stg: PresentationStage) => {
    setStage(stg);
    if (stg === 'FIST_ORB') sounds.playOrbHum();
    else if (stg === 'GALLERY') sounds.playWhoosh();
    else if (stg === 'CARD') sounds.playChime(1.5);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '8px',
        zIndex: 130,
        background: 'rgba(255, 255, 255, 0.94)',
        padding: '6px 14px',
        borderRadius: '30px',
        border: '1.5px solid rgba(233, 30, 99, 0.25)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 30px rgba(216, 27, 96, 0.15)',
      }}
    >
      {stages.map(({ stage, name, key }) => {
        const isActive = currentStage === stage;
        return (
          <button
            key={stage}
            onClick={() => handleStageClick(stage)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: isActive ? '1.5px solid #ffd700' : '1px solid transparent',
              background: isActive
                ? 'linear-gradient(135deg, #d81b60 0%, #ad1457 100%)'
                : 'rgba(0, 0, 0, 0.04)',
              color: isActive ? '#ffd700' : '#555',
              fontWeight: isActive ? 'bold' : 'normal',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: isActive ? '0 4px 16px rgba(216, 27, 96, 0.4)' : 'none',
            }}
          >
            <span>{name}</span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.8,
                padding: '1px 5px',
                background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.06)',
                borderRadius: '4px',
              }}
            >
              {key}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// 10. Webcam PIP View
// ==========================================
function WebcamView({ onReady }: { onReady: (ready: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const hasStarted = useHandStore((state) => state.hasStarted);

  useEffect(() => {
    if (videoRef.current && hasStarted) {
      initHandTracking(videoRef.current).then((success) => {
        setIsReady(success);
        onReady(success);
      });
    }
  }, [onReady, hasStarted]);

  if (!hasStarted) return null;

  return (
    <video
      ref={videoRef}
      style={{
        position: 'fixed',
        top: '64px',
        right: '16px',
        width: '136px',
        height: '102px',
        borderRadius: '16px',
        border: `2px solid ${
          isReady ? '#00e676' : 'rgba(255, 100, 100, 0.5)'
        }`,
        transform: 'scaleX(-1)',
        opacity: isReady ? 0.9 : 0,
        pointerEvents: 'none',
        zIndex: 100,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
      }}
      autoPlay
      playsInline
      muted
    />
  );
}

// ==========================================
// 11. Main Application Root
// ==========================================
export default function App() {
  if (typeof window !== 'undefined') {
    (window as any).__handStore = useHandStore;
  }
  const [hasCamera, setHasCamera] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const hasStarted = useHandStore((state) => state.hasStarted);
  const confirmStart = useHandStore((state) => state.confirmStart);

  const triggerCelebrate = useCallback(() => {
    setBurstCount((c) => c + 1);
  }, []);

  const handleConfirmStart = () => {
    confirmStart();
    sounds.playCelebrationFanfare();
    triggerCelebrate();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stageParam = urlParams.get('stage')?.toLowerCase();
    const state = useHandStore.getState();

    const modalParam = urlParams.get('modal') || urlParams.get('guide') || urlParams.get('help');
    if (modalParam) {
      state.openGestureModal();
    }

    if (stageParam) {
      state.confirmStart();
      if (stageParam === 'orb' || stageParam === 'fist') {
        state.setStage('FIST_ORB');
      } else if (stageParam === 'photos' || stageParam === 'gallery') {
        state.setStage('GALLERY');
      } else if (stageParam === 'card') {
        state.setStage('CARD');
        if (urlParams.get('open') === '1' || urlParams.get('open') === 'true') {
          state.setCardOpened(true);
          triggerCelebrate();
        }
      }
    }

    const photoParam = urlParams.get('photo') || urlParams.get('p');
    if (photoParam) {
      const idx = parseInt(photoParam, 10);
      if (!isNaN(idx) && idx >= 1 && idx <= 9) {
        state.setPhotoIndex(idx - 1);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const curState = useHandStore.getState();

      if (e.key === 'f' || e.key === 'F') {
        curState.toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        curState.toggleLock();
      } else if (e.key === '0') {
        curState.setStage('IDLE');
      } else if (e.key === '1') {
        curState.setStage('FIST_ORB');
        sounds.playOrbHum();
      } else if (e.key === '2') {
        curState.setStage('GALLERY');
        sounds.playWhoosh();
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        curState.setStage('CARD');
        sounds.playChime(1.5);
      } else if (e.key === 'ArrowRight') {
        curState.nextPhoto();
        sounds.playChime();
      } else if (e.key === 'ArrowLeft') {
        curState.prevPhoto();
        sounds.playChime(0.9);
      } else if (e.key === ' ') {
        if (curState.stage === 'CARD') {
          const nextOpen = !curState.isCardOpened;
          curState.setCardOpened(nextOpen);
          if (nextOpen) {
            sounds.playCelebrationFanfare();
            triggerCelebrate();
          }
        } else if (curState.stage === 'FIST_ORB') {
          curState.setStage('GALLERY');
          sounds.playWhoosh();
        } else if (curState.stage === 'IDLE') {
          curState.setStage('FIST_ORB');
          sounds.playOrbHum();
        }
      } else if (e.key >= '1' && e.key <= '9' && curState.stage === 'GALLERY') {
        curState.setPhotoIndex(parseInt(e.key, 10) - 1);
        sounds.playChime(1.0 + parseInt(e.key, 10) * 0.08);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerCelebrate]);

  return (
    <OrientationGuard>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <WebcamView onReady={setHasCamera} />

        <Canvas
          camera={{ position: [0, 3, 35], fov: 60 }}
          dpr={[1, 2]}
          gl={{ antialias: false, alpha: true }}
        >
          <Scene />
          <HandController />
        </Canvas>

        {/* Welcome & Gesture List Overlays */}
        <WelcomeLandingOverlay />
        <GestureListModal onConfirmStart={handleConfirmStart} />

        <ConfettiOverlay triggerBurst={burstCount} />
        <SoundControlButton />
        <FullscreenButton />

        {/* Live Controls only when active */}
        {hasStarted && (
          <>
            <RealtimeGestureGuide hasCamera={hasCamera} />
            <VipPersonaShowcase onCelebrate={triggerCelebrate} />
            <CardCelebrationModal onCelebrate={triggerCelebrate} />
            <BottomStageSelector />
          </>
        )}
      </div>
    </OrientationGuard>
  );
}

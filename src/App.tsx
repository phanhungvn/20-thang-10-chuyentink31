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

  const addBurst = useCallback((count = 120) => {
    if (!canvasRef.current) return;
    const w = canvasRef.current.width;
    const h = canvasRef.current.height;
    const colors = ['#ff4081', '#ff80ab', '#ffd700', '#00ffcc', '#ffffff', '#ff1744', '#ffe57f'];

    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() > 0.5;
      particles.current.push({
        x: isLeft ? w * 0.2 + (Math.random() - 0.5) * 100 : w * 0.8 + (Math.random() - 0.5) * 100,
        y: h * 0.4 + (Math.random() - 0.5) * 100,
        w: 8 + Math.random() * 8,
        h: 6 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 14 + (isLeft ? 4 : -4),
        vy: -8 - Math.random() * 12,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.4 ? 'petal' : Math.random() > 0.5 ? 'circle' : 'rect',
      });
    }
  }, []);

  useEffect(() => {
    if (triggerBurst > 0) {
      addBurst(150);
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
        p.vy += 0.22; // gravity
        p.vx *= 0.985; // drag
        p.rot += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.shape === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.7, p.h * 0.4, 0, 0, Math.PI * 2);
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
// 2. Sound & BGM Toggle Control
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
        gap: '6px',
      }}
    >
      <button
        onClick={toggleSound}
        title={soundEnabled ? 'Tắt hiệu ứng âm thanh' : 'Bật hiệu ứng âm thanh'}
        style={{
          padding: '9px 14px',
          background: soundEnabled ? 'rgba(0, 255, 170, 0.15)' : 'rgba(8, 14, 28, 0.88)',
          border: soundEnabled ? '1px solid #00ffaa' : '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '30px',
          color: soundEnabled ? '#00ffaa' : '#888',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: soundEnabled ? '0 0 14px rgba(0, 255, 170, 0.3)' : 'none',
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
          padding: '9px 14px',
          background: bgmActive ? 'linear-gradient(135deg, rgba(255, 105, 180, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)' : 'rgba(8, 14, 28, 0.88)',
          border: bgmActive ? '1px solid #ff69b4' : '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '30px',
          color: bgmActive ? '#ff88bb' : '#888',
          fontSize: '13px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: bgmActive ? '0 0 16px rgba(255, 105, 180, 0.4)' : 'none',
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
// 3. Fullscreen Button
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
        background: 'rgba(8, 14, 28, 0.88)',
        border: '1px solid rgba(255, 105, 180, 0.45)',
        borderRadius: '30px',
        color: '#ff88bb',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 14px rgba(255, 105, 180, 0.25)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <span style={{ fontSize: '15px' }}>{isFullscreen ? '✕' : '⛶'}</span>
      <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
      <span style={{ fontSize: '10px', opacity: 0.6, padding: '1px 5px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>F</span>
    </button>
  );
}

// ==========================================
// 4. Realtime Gesture Guide (Left Sidebar)
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
      desc: 'Chỉ cần 1 ngón trỏ dơ sang trái (1->9)',
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
      desc: isLocked ? 'Giơ 3 ngón (+ trỏ) để mở khóa' : 'Giơ 2 ngón (giữa + út) để khóa',
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
      desc: 'Mở thiệp bung tỏa pháo hoa & hoa rơi',
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
        width: guideCollapsed ? 'auto' : '330px',
        maxHeight: 'calc(100vh - 100px)',
        background: 'rgba(8, 14, 28, 0.92)',
        border: '1px solid rgba(255, 105, 180, 0.4)',
        borderRadius: '24px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.75), 0 0 25px rgba(255, 105, 180, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.2) 0%, rgba(0, 255, 170, 0.12) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌸</span>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ff99cc', letterSpacing: '0.5px' }}>
              HƯỚNG DẪN CỬ CHỈ 20/10
            </div>
            {!guideCollapsed && (
              <div style={{ fontSize: '10px', color: '#88a0c0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffaa', display: 'inline-block' }} />
                <span>Trực tiếp thời gian thực</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleGuide}
          title={guideCollapsed ? 'Mở rộng hướng dẫn' : 'Thu gọn hướng dẫn'}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            color: '#ff99cc',
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
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Progress Bar */}
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', color: '#ffd700', fontWeight: 'bold' }}>
              <span>Tiến độ biểu diễn</span>
              <span>{currentStepNum} / 6 bước</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #00ffaa, #ff69b4, #ffd700)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                  boxShadow: '0 0 10px #ff69b4',
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
                ? 'rgba(255, 68, 102, 0.2)'
                : 'linear-gradient(135deg, rgba(0, 255, 170, 0.18) 0%, rgba(255, 105, 180, 0.15) 100%)',
              border: isLocked ? '1px solid #ff4466' : '1px solid rgba(0, 255, 170, 0.5)',
              boxShadow: isLocked
                ? '0 0 18px rgba(255, 68, 102, 0.35)'
                : '0 0 18px rgba(0, 255, 170, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: isLocked ? '#ff6688' : '#00ffaa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLocked ? '#ff4466' : '#00ffaa', display: 'inline-block', boxShadow: isLocked ? '0 0 8px #ff4466' : '0 0 8px #00ffaa' }} />
                <span>CỬ CHỈ ĐANG PHÁT HIỆN</span>
              </span>
              <span style={{ fontSize: '10px', opacity: 0.8, color: '#00ffaa', fontWeight: 'bold' }}>
                {hasCamera ? 'AI Camera 60FPS' : 'Chuột / Cảm ứng'}
              </span>
            </div>

            <div style={{ fontSize: '16.5px', fontWeight: '800', color: '#ffffff', margin: '4px 0 2px 0' }}>
              {liveGestureLabel}
            </div>

            <div style={{ fontSize: '11px', color: '#d0d8e8', opacity: 0.95 }}>
              {liveGestureDesc}
            </div>
          </div>

          {/* Interactive Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {steps.map((st) => (
              <div
                key={st.num}
                onClick={st.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '16px',
                  background: st.isCurrent
                    ? 'linear-gradient(135deg, rgba(255, 105, 180, 0.28) 0%, rgba(255, 215, 0, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: st.isCurrent
                    ? '1.5px solid #ff69b4'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: st.isCurrent ? '0 0 16px rgba(255, 105, 180, 0.45)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: st.isCurrent
                      ? 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '17px',
                    flexShrink: 0,
                    boxShadow: st.isCurrent ? '0 2px 12px rgba(255, 105, 180, 0.6)' : 'none',
                  }}
                >
                  {st.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: st.isCurrent ? '#ffd700' : '#ffffff' }}>
                      Bước {st.num}: {st.name}
                    </span>
                    {st.isCurrent && (
                      <span style={{ fontSize: '10px', color: '#ff69b4', fontWeight: 'bold' }}>
                        ● Đang chọn
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#a0b0c8', marginTop: '2px', lineHeight: '1.3' }}>
                    {st.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts Hint */}
          <div
            style={{
              padding: '9px 12px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '10.5px',
              color: '#8899aa',
              lineHeight: '1.4',
            }}
          >
            💡 <b style={{ color: '#ccc' }}>Phím tắt nhanh:</b> Phím <b>1</b> (Cầu kiếm), <b>2</b> (9 Ảnh), <b>3/C</b> (Thiệp), <b>Space</b> (Mở thiệp), <b>L</b> (Khóa), <b>Mũi tên</b> (Lướt ảnh), <b>F</b> (Toàn màn hình).
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. Gallery Overlay (Bottom Persona Card)
// ==========================================
function GalleryOverlay({ onCelebrate }: { onCelebrate: () => void }) {
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
        bottom: '82px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 140,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '92%',
        maxWidth: '620px',
        pointerEvents: 'auto',
      }}
    >
      {/* Persona Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(10, 16, 32, 0.92)',
          border: '1.5px solid rgba(255, 105, 180, 0.45)',
          borderRadius: '24px',
          padding: '16px 22px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 105, 180, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Avatar Box */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 18px rgba(255, 105, 180, 0.5)',
            border: '2px solid #ffd700',
          }}
        >
          <span style={{ fontSize: '22px' }}>👑</span>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
            Ảnh {current.id}
          </span>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '19px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.3px' }}>
              {current.name}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#ffd700',
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.4)',
                padding: '2px 8px',
                borderRadius: '10px',
              }}
            >
              ★ {current.role}
            </span>
          </div>

          <div
            style={{
              fontSize: '12.5px',
              color: '#d0d8e8',
              marginTop: '6px',
              lineHeight: '1.4',
              fontStyle: 'italic',
            }}
          >
            “{current.wish}”
          </div>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(8, 14, 28, 0.90)',
          padding: '6px 14px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
        }}
      >
        <button
          onClick={handlePrev}
          title="Người trước đó (← hoặc 1 ngón lướt phải)"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#fff',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
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
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: isSelected ? '1px solid #ffd700' : 'none',
                  background: isSelected
                    ? 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 10px rgba(255, 105, 180, 0.7)' : 'none',
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
          title="Người tiếp theo (→ hoặc 1 ngón lướt trái)"
          style={{
            background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
            border: 'none',
            color: '#fff',
            borderRadius: '16px',
            padding: '5px 14px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 10px rgba(255, 105, 180, 0.4)',
          }}
        >
          <span>Sau</span>
          <span>▶</span>
        </button>

        <button
          onClick={onCelebrate}
          title="Tung thêm hoa & pháo chúc mừng"
          style={{
            background: 'rgba(255, 215, 0, 0.15)',
            border: '1px solid #ffd700',
            color: '#ffd700',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          🌸 Tung Hoa
        </button>

        <button
          onClick={() => {
            setStage('CARD');
            sounds.playChime(1.5);
          }}
          title="Chuyển sang Thiệp 20/10"
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
            border: 'none',
            color: '#4a0026',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)',
          }}
        >
          ✉️ Thiệp 20/10
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 6. Card Celebration Modal
// ==========================================
function CardCelebrationModal({ onCelebrate }: { onCelebrate: () => void }) {
  const stage = useHandStore((state) => state.stage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);
  const setCardOpened = useHandStore((state) => state.setCardOpened);
  const setStage = useHandStore((state) => state.setStage);
  const [copied, setCopied] = useState(false);

  if (stage !== 'CARD') return null;

  const wishContent = `Kính chúc toàn thể phái đẹp luôn luôn xinh đẹp rạng rỡ, ngập tràn sức khỏe, hạnh phúc viên mãn bên những người yêu thương và luôn tự tin tỏa sáng với đam mê của mình! Chúc mừng ngày Phụ Nữ Việt Nam 20/10! 🌸💖`;

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
    <div
      style={{
        position: 'fixed',
        bottom: '82px',
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
            padding: '16px 36px',
            borderRadius: '35px',
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            border: '2px solid #ffd700',
            color: '#ffffff',
            fontSize: '16.5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 32px rgba(255, 65, 108, 0.8), 0 0 16px #ffd700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulseGlow 2s infinite ease-in-out',
          }}
        >
          <span style={{ fontSize: '22px' }}>👏</span>
          <span>Chụp 2 bàn tay hoặc Click để MỞ THIỆP!</span>
          <span style={{ fontSize: '11px', opacity: 0.85, padding: '2px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>[Space]</span>
        </button>
      ) : (
        <div
          style={{
            background: 'rgba(12, 18, 36, 0.94)',
            border: '2px solid rgba(255, 215, 0, 0.7)',
            borderRadius: '28px',
            padding: '24px 34px',
            backdropFilter: 'blur(26px)',
            boxShadow: '0 14px 50px rgba(0, 0, 0, 0.8), 0 0 45px rgba(255, 215, 0, 0.4)',
            textAlign: 'center',
            maxWidth: '580px',
            animation: 'floatGentle 4s infinite ease-in-out',
          }}
        >
          <div style={{ fontSize: '38px', marginBottom: '8px' }}>🌸 💖 👑 💖 🌸</div>
          <h2 style={{ color: '#ffd700', fontSize: '24px', margin: '0 0 10px 0', textShadow: '0 0 16px rgba(255, 215, 0, 0.8)', fontWeight: '800' }}>
            CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10!
          </h2>
          <p style={{ color: '#ffffff', fontSize: '14.5px', lineHeight: '1.65', margin: '0 0 18px 0', fontStyle: 'italic' }}>
            {wishContent}
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onCelebrate();
                sounds.playCelebrationFanfare();
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                border: '1px solid #ffd700',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 65, 108, 0.4)',
              }}
            >
              🎆 Tung Thêm Pháo Hoa
            </button>

            <button
              onClick={copyWish}
              style={{
                padding: '9px 20px',
                borderRadius: '20px',
                background: copied ? 'rgba(0, 255, 170, 0.25)' : 'rgba(255, 255, 255, 0.12)',
                border: copied ? '1px solid #00ffaa' : '1px solid rgba(255, 255, 255, 0.25)',
                color: copied ? '#00ffaa' : '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Đã sao chép!' : '📋 Sao Chép Lời Chúc'}
            </button>

            <button
              onClick={() => {
                setStage('GALLERY');
                sounds.playWhoosh();
              }}
              style={{
                padding: '9px 20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255, 105, 180, 0.4)',
              }}
            >
              🌸 Xem Lại 9 Ảnh
            </button>

            <button
              onClick={() => setCardOpened(false)}
              style={{
                padding: '9px 20px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ddd',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Đóng thiệp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. Bottom Stage Selector
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
        background: 'rgba(8, 14, 28, 0.88)',
        padding: '6px 14px',
        borderRadius: '30px',
        border: '1px solid rgba(255, 105, 180, 0.35)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 105, 180, 0.2)',
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
              border: isActive ? '1px solid #ff69b4' : '1px solid transparent',
              background: isActive
                ? 'linear-gradient(135deg, rgba(255, 105, 180, 0.35) 0%, rgba(255, 215, 0, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              color: isActive ? '#ffd700' : '#bbb',
              fontWeight: isActive ? 'bold' : 'normal',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: isActive ? '0 0 14px rgba(255, 105, 180, 0.5)' : 'none',
            }}
          >
            <span>{name}</span>
            <span
              style={{
                fontSize: '10px',
                opacity: 0.6,
                padding: '1px 5px',
                background: 'rgba(255,255,255,0.1)',
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
// 8. Webcam PIP View
// ==========================================
function WebcamView({ onReady }: { onReady: (ready: boolean) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      initHandTracking(videoRef.current).then((success) => {
        setIsReady(success);
        onReady(success);
      });
    }
  }, [onReady]);

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
          isReady ? 'rgba(0, 255, 170, 0.7)' : 'rgba(255, 100, 100, 0.4)'
        }`,
        transform: 'scaleX(-1)',
        opacity: isReady ? 0.9 : 0,
        pointerEvents: 'none',
        zIndex: 100,
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
      }}
      autoPlay
      playsInline
      muted
    />
  );
}

// ==========================================
// 9. Main Application Root
// ==========================================
export default function App() {
  const [hasCamera, setHasCamera] = useState(false);
  const [burstCount, setBurstCount] = useState(0);

  const triggerCelebrate = useCallback(() => {
    setBurstCount((c) => c + 1);
  }, []);

  useEffect(() => {
    // Check URL params for direct demo links (e.g. ?stage=photos or ?stage=card&open=true)
    const urlParams = new URLSearchParams(window.location.search);
    const stageParam = urlParams.get('stage')?.toLowerCase();
    const state = useHandStore.getState();

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

        <ConfettiOverlay triggerBurst={burstCount} />
        <SoundControlButton />
        <FullscreenButton />
        <RealtimeGestureGuide hasCamera={hasCamera} />
        <GalleryOverlay onCelebrate={triggerCelebrate} />
        <CardCelebrationModal onCelebrate={triggerCelebrate} />
        <BottomStageSelector />
      </div>
    </OrientationGuard>
  );
}

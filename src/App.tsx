import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Scene } from './components/Scene';
import { HandController } from './components/HandController';
import { initHandTracking } from './services/HandTrackingService';
import { useHandStore, PERSON_PROFILES } from './store';
import type { PresentationStage } from './store';
import { OrientationGuard } from './components/OrientationGuard';
import './index.css';

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

function RealtimeGestureGuide({ hasCamera }: { hasCamera: boolean }) {
  const liveGestureLabel = useHandStore((state) => state.liveGestureLabel);
  const liveGestureDesc = useHandStore((state) => state.liveGestureDesc);
  const stage = useHandStore((state) => state.stage);
  const isLocked = useHandStore((state) => state.isLocked);
  const guideCollapsed = useHandStore((state) => state.guideCollapsed);
  const toggleGuide = useHandStore((state) => state.toggleGuide);
  const toggleLock = useHandStore((state) => state.toggleLock);
  const setStage = useHandStore((state) => state.setStage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);

  const steps = [
    {
      num: '1',
      icon: '✊',
      name: 'Nắm đấm',
      desc: 'Tạo quả cầu kiếm hộ thể',
      isCurrent: stage === 'FIST_ORB',
      onClick: () => setStage('FIST_ORB'),
    },
    {
      num: '2',
      icon: '🖐️',
      name: 'Mở 5 ngón',
      desc: 'Mở triển lãm 9 ảnh mỹ nhân',
      isCurrent: stage === 'GALLERY',
      onClick: () => setStage('GALLERY'),
    },
    {
      num: '3',
      icon: '☝️',
      name: 'Lướt 1 ngón qua trái',
      desc: 'Chỉ cần 1 ngón trỏ dơ sang trái (1->9)',
      isCurrent: stage === 'GALLERY',
      onClick: () => useHandStore.getState().nextPhoto(),
    },
    {
      num: '4',
      icon: isLocked ? '🔒' : '🟢',
      name: isLocked ? 'Đã khóa chống nhiễu' : 'Chống nhiễu tín hiệu',
      desc: isLocked ? 'Giơ 3 ngón (+ trỏ) để mở khóa' : 'Giơ 2 ngón (giữa + út) để khóa',
      isCurrent: isLocked,
      isSpecial: true,
      onClick: () => toggleLock(),
    },
    {
      num: '5',
      icon: '✌️',
      name: 'Xuất hiện thiệp 20/10',
      desc: 'Giơ 2 ngón chữ V (✌️) hoặc lướt hết 9 ảnh',
      isCurrent: stage === 'CARD' && !isCardOpened,
      onClick: () => setStage('CARD'),
    },
    {
      num: '6',
      icon: '👏',
      name: 'Chụp 2 bàn tay',
      desc: 'Mở thiệp bung tỏa pháo hoa',
      isCurrent: stage === 'CARD' && isCardOpened,
      onClick: () => {
        setStage('CARD');
        useHandStore.getState().setCardOpened(true);
      },
    },
  ];

  return (
    <div
      className="guide-panel"
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 150,
        width: guideCollapsed ? 'auto' : '320px',
        maxHeight: 'calc(100vh - 110px)',
        background: 'rgba(8, 14, 28, 0.90)',
        border: '1px solid rgba(255, 105, 180, 0.35)',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 105, 180, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.15) 0%, rgba(0, 255, 170, 0.1) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🌸</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff99cc', letterSpacing: '0.5px' }}>
              HƯỚNG DẪN CỬ CHỈ 20/10
            </div>
            {!guideCollapsed && (
              <div style={{ fontSize: '10px', color: '#88a0c0' }}>
                Cập nhật trực tiếp thời gian thực
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleGuide}
          title={guideCollapsed ? 'Mở rộng hướng dẫn' : 'Thu gọn hướng dẫn'}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#ff99cc',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '4px 10px',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          {guideCollapsed ? 'Mở rộng ▾' : 'Thu gọn ▴'}
        </button>
      </div>

      {!guideCollapsed && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
          {/* Live Detected Gesture Monitor Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '18px',
              background: isLocked
                ? 'rgba(255, 68, 102, 0.18)'
                : 'linear-gradient(135deg, rgba(0, 255, 170, 0.15) 0%, rgba(255, 105, 180, 0.12) 100%)',
              border: isLocked ? '1px solid #ff4466' : '1px solid rgba(0, 255, 170, 0.45)',
              boxShadow: isLocked
                ? '0 0 16px rgba(255, 68, 102, 0.3)'
                : '0 0 16px rgba(0, 255, 170, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: isLocked ? '#ff6688' : '#00ffaa' }}>
                ● CỬ CHỈ ĐANG PHÁT HIỆN
              </span>
              <span style={{ fontSize: '10px', opacity: 0.7, color: '#aaa' }}>
                {hasCamera ? 'Webcam AI' : 'Chuột'}
              </span>
            </div>

            <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '4px 0 2px 0' }}>
              {liveGestureLabel}
            </div>

            <div style={{ fontSize: '11px', color: '#d0d8e8', opacity: 0.9 }}>
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
                    ? 'rgba(255, 105, 180, 0.22)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: st.isCurrent
                    ? '1px solid #ff69b4'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: st.isCurrent ? '0 0 14px rgba(255, 105, 180, 0.35)' : 'none',
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
                      ? 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)'
                      : 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    boxShadow: st.isCurrent ? '0 2px 10px rgba(255, 105, 180, 0.5)' : 'none',
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
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '10px',
              color: '#8899aa',
              lineHeight: '1.4',
            }}
          >
            💡 <b style={{ color: '#ccc' }}>Phím tắt biểu diễn:</b> Phím <b>1</b> (Cầu kiếm), <b>2</b> (9 Ảnh), <b>3/C</b> (Thiệp), <b>Space</b> (Mở thiệp), <b>L</b> (Khóa), <b>Mũi tên</b> (Lướt ảnh), <b>F</b> (Toàn màn hình).
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryOverlay() {
  const stage = useHandStore((state) => state.stage);
  const currentPhotoIndex = useHandStore((state) => state.currentPhotoIndex);
  const nextPhoto = useHandStore((state) => state.nextPhoto);
  const prevPhoto = useHandStore((state) => state.prevPhoto);
  const setPhotoIndex = useHandStore((state) => state.setPhotoIndex);
  const setStage = useHandStore((state) => state.setStage);

  if (stage !== 'GALLERY') return null;

  const current = PERSON_PROFILES[currentPhotoIndex];

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
        maxWidth: '580px',
        pointerEvents: 'auto',
      }}
    >
      {/* Luxury Profile Glass Card */}
      <div
        style={{
          width: '100%',
          background: 'rgba(10, 16, 32, 0.88)',
          border: '1px solid rgba(255, 105, 180, 0.45)',
          borderRadius: '26px',
          padding: '18px 22px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 105, 180, 0.3)',
          display: 'flex',
          gap: '18px',
          alignItems: 'center',
          animation: 'pulseGlow 4s infinite ease-in-out',
        }}
      >
        {/* Avatar Frame */}
        <div
          style={{
            width: '92px',
            height: '92px',
            borderRadius: '22px',
            background: current.avatarColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            flexShrink: 0,
            boxShadow: '0 6px 20px rgba(255, 105, 180, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          <span style={{ fontSize: '26px' }}>👑</span>
          <span style={{ fontSize: '13px', marginTop: '2px', letterSpacing: '0.5px' }}>{current.label}</span>
        </div>

        {/* Info & Heartfelt Wish */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <h2 style={{ fontSize: '22px', color: '#fff', fontWeight: '800', margin: 0, letterSpacing: '0.5px' }}>
              {current.name}
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.3) 0%, rgba(255, 215, 0, 0.3) 100%)',
                color: '#ffd700',
                border: '1px solid rgba(255, 215, 0, 0.5)',
              }}
            >
              ⭐ {current.role}
            </span>
          </div>

          <p
            style={{
              fontSize: '13.5px',
              color: '#f8f9fa',
              lineHeight: '1.5',
              margin: '8px 0 0 0',
              fontStyle: 'italic',
            }}
          >
            “{current.wish}”
          </p>
        </div>
      </div>

      {/* Navigation Controls: Prev, Next & 1..9 Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(8, 14, 28, 0.88)',
          padding: '6px 14px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={prevPhoto}
          style={{
            padding: '7px 16px',
            borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ◀ Trước
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          {PERSON_PROFILES.map((p, idx) => {
            const active = idx === currentPhotoIndex;
            return (
              <button
                key={p.id}
                onClick={() => setPhotoIndex(idx)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: active ? '1.5px solid #ff69b4' : '1px solid transparent',
                  background: active ? '#ff69b4' : 'rgba(255, 255, 255, 0.1)',
                  color: active ? '#fff' : '#aaa',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: active ? '0 0 12px rgba(255, 105, 180, 0.7)' : 'none',
                }}
              >
                {p.id}
              </button>
            );
          })}
        </div>

        <button
          onClick={nextPhoto}
          style={{
            padding: '7px 16px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 0 12px rgba(255, 105, 180, 0.4)',
          }}
        >
          Sau ▶
        </button>

        <button
          onClick={() => setStage('CARD')}
          title="Mở thiệp chúc mừng 20/10 (Phím C)"
          style={{
            padding: '7px 14px',
            borderRadius: '18px',
            background: 'rgba(255, 215, 0, 0.25)',
            border: '1px solid #ffd700',
            color: '#ffd700',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: '4px',
          }}
        >
          ✉️ Thiệp 20/10
        </button>
      </div>
    </div>
  );
}

function CardCelebrationModal() {
  const stage = useHandStore((state) => state.stage);
  const isCardOpened = useHandStore((state) => state.isCardOpened);
  const setCardOpened = useHandStore((state) => state.setCardOpened);
  const setStage = useHandStore((state) => state.setStage);

  if (stage !== 'CARD') return null;

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
          onClick={() => setCardOpened(true)}
          style={{
            padding: '16px 32px',
            borderRadius: '35px',
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            border: '2px solid #ffd700',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255, 65, 108, 0.8), 0 0 15px #ffd700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'pulseGlow 2s infinite ease-in-out',
          }}
        >
          <span style={{ fontSize: '20px' }}>👏</span>
          <span>Chụp 2 bàn tay hoặc Click để MỞ THIỆP!</span>
          <span style={{ fontSize: '11px', opacity: 0.8, padding: '2px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>[Space]</span>
        </button>
      ) : (
        <div
          style={{
            background: 'rgba(12, 18, 36, 0.94)',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            borderRadius: '28px',
            padding: '22px 32px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.35)',
            textAlign: 'center',
            maxWidth: '560px',
            animation: 'floatGentle 4s infinite ease-in-out',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌸 💖 👑 💖 🌸</div>
          <h2 style={{ color: '#ffd700', fontSize: '24px', margin: '0 0 10px 0', textShadow: '0 0 15px rgba(255, 215, 0, 0.8)', fontWeight: '800' }}>
            CHÚC MỪNG NGÀY PHỤ NỮ VIỆT NAM 20/10!
          </h2>
          <p style={{ color: '#ffffff', fontSize: '14.5px', lineHeight: '1.65', margin: '0 0 16px 0', fontStyle: 'italic' }}>
            Kính chúc toàn thể phái đẹp luôn luôn xinh đẹp rạng rỡ, ngập tràn sức khỏe, hạnh phúc viên mãn bên những người yêu thương và luôn tự tin tỏa sáng với đam mê của mình!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setStage('GALLERY')}
              style={{
                padding: '9px 22px',
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
                padding: '9px 22px',
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

function BottomStageSelector() {
  const currentStage = useHandStore((state) => state.stage);
  const setStage = useHandStore((state) => state.setStage);

  const stages: { stage: PresentationStage; name: string; key: string }[] = [
    { stage: 'IDLE', name: '⚔️ Kiếm Trận', key: '0' },
    { stage: 'FIST_ORB', name: '✊ Quả Cầu Kiếm', key: '1' },
    { stage: 'GALLERY', name: '🖐️ 9 Ảnh Mỹ Nhân', key: '2' },
    { stage: 'CARD', name: '✉️ Thiệp 20/10', key: '3' },
  ];

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
        backdropFilter: 'blur(14px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 105, 180, 0.15)',
      }}
    >
      {stages.map(({ stage, name, key }) => {
        const isActive = currentStage === stage;
        return (
          <button
            key={stage}
            onClick={() => setStage(stage)}
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
          isReady ? 'rgba(0, 255, 170, 0.6)' : 'rgba(255, 100, 100, 0.3)'
        }`,
        transform: 'scaleX(-1)',
        opacity: isReady ? 0.85 : 0,
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

export default function App() {
  const [hasCamera, setHasCamera] = useState(false);

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
      const state = useHandStore.getState();

      if (e.key === 'f' || e.key === 'F') {
        state.toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        state.toggleLock();
      } else if (e.key === '0') {
        state.setStage('IDLE');
      } else if (e.key === '1') {
        state.setStage('FIST_ORB');
      } else if (e.key === '2') {
        state.setStage('GALLERY');
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        state.setStage('CARD');
      } else if (e.key === 'ArrowRight') {
        state.nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        state.prevPhoto();
      } else if (e.key === ' ') {
        if (state.stage === 'CARD') {
          state.setCardOpened(!state.isCardOpened);
        } else if (state.stage === 'FIST_ORB') {
          state.setStage('GALLERY');
        } else if (state.stage === 'IDLE') {
          state.setStage('FIST_ORB');
        }
      } else if (e.key >= '1' && e.key <= '9' && state.stage === 'GALLERY') {
        state.setPhotoIndex(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

        <FullscreenButton />
        <RealtimeGestureGuide hasCamera={hasCamera} />
        <GalleryOverlay />
        <CardCelebrationModal />
        <BottomStageSelector />
      </div>
    </OrientationGuard>
  );
}

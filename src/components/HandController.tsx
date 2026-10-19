import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHandStore } from '../store';
import {
  globalVideo,
  globalLandmarker,
  analyzeGestures,
} from '../services/HandTrackingService';
import { sounds } from '../services/SoundService';

let lastVideoTime = -1;

export function HandController() {
  const { camera, pointer } = useThree();
  const setTarget = useHandStore((state) => state.setTarget);
  const setTracking = useHandStore((state) => state.setTracking);
  const updatePath = useHandStore((state) => state.updatePath);

  // Tracking state debounce & swipe history
  const lastSwipeTime = useRef(0);
  const lastGestureChangeTime = useRef(0);
  const currentHandX = useRef(0.5);
  const prevHandX = useRef(0.5);
  const prevIndexTipX = useRef(0.5);
  const wasPointingLeft = useRef(false);
  const indexStrokeHistory = useRef<{ x: number; y: number; time: number }[]>([]);

  // Gesture state debouncing
  const pendingLockTime = useRef(0);
  const pendingUnlockTime = useRef(0);
  const pendingFistTime = useRef(0);
  const pendingPalmTime = useRef(0);
  const pendingVTime = useRef(0);
  const lastLiveUpdate = useRef(0);

  useFrame(({ clock }) => {
    const hasCamera = Boolean(
      globalLandmarker &&
      globalVideo &&
      globalVideo.readyState === 4 &&
      globalVideo.currentTime !== lastVideoTime
    );

    const now = clock.getElapsedTime();
    const { stage, isLocked, hasStarted } = useHandStore.getState();

    // Only recognize gestures once user has clicked Bắt Đầu and confirmed gestures!
    if (!hasStarted) {
      return;
    }

    if (hasCamera) {
      lastVideoTime = globalVideo!.currentTime;
      const results = globalLandmarker!.detectForVideo(
        globalVideo!,
        performance.now()
      );

      if (results.landmarks && results.landmarks.length > 0) {
        setTracking(true);
        const analysis = analyzeGestures(results.landmarks);

        if (analysis) {
          const {
            isFist,
            isOpenPalm,
            isOneFinger,
            isTwoFingersV,
            isLockGesture,
            isUnlockGesture,
            isTwoHandsClap,
            palmCenter,
            indexTip,
            indexKnuckle,
          } = analysis;

          // Track movement for swipe & strokes
          prevHandX.current = currentHandX.current;
          currentHandX.current = palmCenter.x;
          const tipDx = indexTip.x - prevIndexTipX.current;
          prevIndexTipX.current = indexTip.x;

          const palmDx = currentHandX.current - prevHandX.current;

          // Finger pointing direction relative to mirrored view:
          // In raw webcam coords (mirrored on screen):
          // User points/flicks to THEIR LEFT -> indexTip.x > indexKnuckle.x (positive dx)
          // User points/flicks to THEIR RIGHT -> indexTip.x < indexKnuckle.x (negative dx)
          const pointingVectorX = indexTip.x - indexKnuckle.x;
          const isPointedLeft = pointingVectorX > 0.05;
          const isPointedRight = pointingVectorX < -0.05;

          // Update live gesture label every ~100ms
          if (now - lastLiveUpdate.current > 0.1) {
            lastLiveUpdate.current = now;
            if (isTwoHandsClap) {
              useHandStore.getState().setLiveGesture('👏 2 Bàn Tay Chụp Lại', 'Mở bung thiệp chúc mừng 20/10!', 6);
            } else if (isLockGesture) {
              useHandStore.getState().setLiveGesture('🔒 Khóa Chống Nhiễu (2 ngón)', 'Giơ ngón giữa + út để khóa', 4);
            } else if (isUnlockGesture) {
              useHandStore.getState().setLiveGesture('🟢 Mở Khóa Cử Chỉ (3 ngón)', 'Giơ ngón trỏ + giữa + út để mở', 4);
            } else if (isTwoFingersV) {
              useHandStore.getState().setLiveGesture('✌️ Chữ V (2 ngón)', 'Xuất hiện thiệp mừng 20/10 hoàng gia', 5);
            } else if (isOneFinger) {
              if (isPointedLeft || tipDx > 0.02) {
                useHandStore.getState().setLiveGesture('👈 1 Ngón Lướt Trái', 'Đang chuyển sang ảnh tiếp theo', 3);
              } else if (isPointedRight || tipDx < -0.02) {
                useHandStore.getState().setLiveGesture('👉 1 Ngón Lướt Phải', 'Đang quay lại ảnh trước đó', 3);
              } else {
                useHandStore.getState().setLiveGesture('☝️ 1 Ngón Trỏ', 'Chỉ hoặc lướt qua trái để xem tiếp', 3);
              }
            } else if (isFist) {
              useHandStore.getState().setLiveGesture('✊ Nắm Đấm', 'Tạo quả cầu kiếm bảo vệ', 1);
            } else if (isOpenPalm) {
              if (stage === 'FIST_ORB') {
                useHandStore.getState().setLiveGesture('🖐️ Mở 5 Ngón', 'Hiện triển lãm 9 bức ảnh mỹ nhân', 2);
              } else if (stage === 'GALLERY') {
                useHandStore.getState().setLiveGesture('🖐️ Bàn Tay Mở', 'Dơ 1 ngón trỏ lướt trái để sang người kế tiếp', 3);
              } else if (stage === 'CARD') {
                useHandStore.getState().setLiveGesture('👐 2 Tay Sẵn Sàng', 'Chụp 2 bàn tay vào nhau để mở thiệp', 6);
              } else {
                useHandStore.getState().setLiveGesture('🖐️ Bàn Tay Mở', 'Đang điều khiển hướng bay của kiếm', 1);
              }
            } else {
              useHandStore.getState().setLiveGesture('✨ Cử Chỉ Khác', isLocked ? 'Đang bật khóa chống nhiễu' : 'Sẵn sàng nhận cử chỉ', undefined);
            }
          }

          // 1. Chống nhiễu: Giơ ngón giữa + ngón út để KHÓA
          if (isLockGesture) {
            if (pendingLockTime.current === 0) pendingLockTime.current = now;
            else if (now - pendingLockTime.current > 0.35 && !isLocked) {
              useHandStore.getState().toggleLock(true);
            }
          } else {
            pendingLockTime.current = 0;
          }

          // 2. Chống nhiễu: Giơ ngón trỏ + ngón giữa + ngón út để MỞ KHÓA
          if (isUnlockGesture) {
            if (pendingUnlockTime.current === 0) pendingUnlockTime.current = now;
            else if (now - pendingUnlockTime.current > 0.35 && isLocked) {
              useHandStore.getState().toggleLock(false);
            }
          } else {
            pendingUnlockTime.current = 0;
          }

          // Nếu chưa bị khóa thì xử lý các cử chỉ tương tác
          if (!isLocked) {
            // Cử chỉ 1: Nắm tay -> tạo quả cầu kiếm
            if (isFist) {
              if (pendingFistTime.current === 0) pendingFistTime.current = now;
              else if (now - pendingFistTime.current > 0.3 && stage !== 'FIST_ORB') {
                useHandStore.getState().setStage('FIST_ORB');
                sounds.playOrbHum();
              }
            } else {
              pendingFistTime.current = 0;
            }

            // Cử chỉ 2: Mở 5 ngón sau khi nắm tay -> Hiện 9 ảnh
            if (isOpenPalm && stage === 'FIST_ORB') {
              if (pendingPalmTime.current === 0) pendingPalmTime.current = now;
              else if (now - pendingPalmTime.current > 0.35) {
                useHandStore.getState().setStage('GALLERY');
                sounds.playWhoosh();
              }
            } else if (stage !== 'FIST_ORB') {
              pendingPalmTime.current = 0;
            }

            // Cử chỉ 3: CHỈ CẦN 1 NGÓN DƠ QUA TRÁI (k cần 5 ngón) -> Chuyển người tiếp theo
            if (stage === 'GALLERY') {
              const isFlickLeft = tipDx > 0.025 || palmDx > 0.025;
              const isFlickRight = tipDx < -0.025 || palmDx < -0.025;
              const isFreshPointLeft = isPointedLeft && !wasPointingLeft.current;
              wasPointingLeft.current = isPointedLeft;

              if (isOneFinger || isOpenPalm) {
                if ((isFlickLeft || isFreshPointLeft) && (now - lastSwipeTime.current > 0.55)) {
                  const currentIdx = useHandStore.getState().currentPhotoIndex;
                  // Nếu đang ở ảnh 9 (người cuối cùng), lướt tiếp sẽ tự động chuyển sang Thiệp 20/10!
                  if (currentIdx === 8) {
                    useHandStore.getState().setStage('CARD');
                    sounds.playChime(1.5);
                  } else {
                    useHandStore.getState().nextPhoto();
                    sounds.playChime(1.0 + (currentIdx * 0.08));
                    sounds.playWhoosh();
                  }
                  lastSwipeTime.current = now;
                } else if (isFlickRight && (now - lastSwipeTime.current > 0.55)) {
                  useHandStore.getState().prevPhoto();
                  sounds.playChime(0.9);
                  sounds.playWhoosh();
                  lastSwipeTime.current = now;
                }
              }

              // Cử chỉ 4: Xuất hiện Thiệp 20/10
              // Cách 1: Giơ 2 ngón tay chữ V (✌️ Peace / Victory) - Siêu nhạy & ổn định 100%
              if (isTwoFingersV) {
                if (pendingVTime.current === 0) pendingVTime.current = now;
                else if (now - pendingVTime.current > 0.25) {
                  useHandStore.getState().setStage('CARD');
                  sounds.playChime(1.5);
                  pendingVTime.current = 0;
                }
              } else {
                pendingVTime.current = 0;
              }

              // Cách 2: Vẽ khung khép kín bằng 1 ngón trỏ (nếu muốn vẽ)
              if (isOneFinger) {
                indexStrokeHistory.current.push({ x: indexTip.x, y: indexTip.y, time: now });
                indexStrokeHistory.current = indexStrokeHistory.current.filter((p) => now - p.time <= 1.5);

                if (indexStrokeHistory.current.length > 20 && (now - lastGestureChangeTime.current > 1.5)) {
                  const pts = indexStrokeHistory.current;
                  let minX = 1, maxX = 0, minY = 1, maxY = 0;
                  for (const p of pts) {
                    if (p.x < minX) minX = p.x;
                    if (p.x > maxX) maxX = p.x;
                    if (p.y < minY) minY = p.y;
                    if (p.y > maxY) maxY = p.y;
                  }
                  const width = maxX - minX;
                  const height = maxY - minY;
                  const startPt = pts[0];
                  const endPt = pts[pts.length - 1];
                  const closeDist = Math.hypot(startPt.x - endPt.x, startPt.y - endPt.y);

                  if (width > 0.16 && height > 0.12 && closeDist < 0.12) {
                    useHandStore.getState().setStage('CARD');
                    sounds.playChime(1.5);
                    indexStrokeHistory.current = [];
                    lastGestureChangeTime.current = now;
                  }
                }
              } else {
                indexStrokeHistory.current = [];
              }
            }

            // Cử chỉ 5: Khi ở chế độ thiệp, 2 bàn tay mở 5 ngón chụp lại -> Mở thiệp
            if (stage === 'CARD') {
              if (isTwoHandsClap && !useHandStore.getState().isCardOpened) {
                useHandStore.getState().setCardOpened(true);
                sounds.playCelebrationFanfare();
              }
            }
          }

          // Chuyển đổi tọa độ màn hình sang không gian 3D
          const ndcX = (1 - palmCenter.x) * 2 - 1;
          const ndcY = -(palmCenter.y * 2 - 1);

          const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
          const dir = vec.sub(camera.position).normalize();
          const dist = -camera.position.z / dir.z;
          const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));

          setTarget(worldPos);

          const currentMode = useHandStore.getState().gestureMode;
          if (currentMode === 'DRAGON') {
            updatePath(worldPos);
          }
          return;
        }
      } else {
        if (now - lastLiveUpdate.current > 0.5) {
          lastLiveUpdate.current = now;
          useHandStore.getState().setLiveGesture('Đang quét camera...', 'Chưa phát hiện bàn tay trong khung hình', undefined);
        }
      }
    } else {
      if (now - lastLiveUpdate.current > 0.5) {
        lastLiveUpdate.current = now;
        useHandStore.getState().setLiveGesture('🖱️ Chuột / Cảm ứng', 'Di chuột & click nút để điều khiển', undefined);
      }
    }

    // Fallback: Di chuột / Cảm ứng khi không có webcam
    setTracking(true);
    const ndcX = pointer.x;
    const ndcY = pointer.y;

    const vec = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const worldPos = camera.position.clone().add(dir.multiplyScalar(dist));

    setTarget(worldPos);

    const activeMode = useHandStore.getState().gestureMode;
    if (activeMode === 'DRAGON') {
      updatePath(worldPos);
    }
  });

  return null;
}

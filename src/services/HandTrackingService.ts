import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import type { GestureMode } from '../store';

export let globalVideo: HTMLVideoElement | null = null;
export let globalLandmarker: HandLandmarker | null = null;
let initPromise: Promise<boolean> | null = null;

export function initHandTracking(videoElement: HTMLVideoElement) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    globalVideo = videoElement;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('getUserMedia is not supported or blocked in insecure context. Mouse fallback enabled.');
        return false;
      }

      let isPortrait = false;
      if (typeof screen !== 'undefined' && screen.orientation) {
        isPortrait = screen.orientation.type.includes('portrait');
      } else if (typeof window.orientation !== 'undefined') {
        isPortrait = Math.abs(window.orientation as number) !== 90;
      } else if (typeof window !== 'undefined') {
        isPortrait = window.innerHeight > window.innerWidth;
      }

      const widthIdeal = isPortrait ? 480 : 640;
      const heightIdeal = isPortrait ? 640 : 480;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: widthIdeal },
          height: { ideal: heightIdeal },
          facingMode: 'user',
        },
      });

      videoElement.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoElement.readyState >= 2) {
          resolve();
        } else {
          videoElement.onloadeddata = () => resolve();
        }
      });

      await videoElement.play().catch((e) => {
        console.warn('Auto-play failed, waiting for user interaction', e);
      });

      const baseUrl = import.meta.env.BASE_URL;
      const vision = await FilesetResolver.forVisionTasks(`${baseUrl}models/wasm`);

      // Track up to 2 hands for clapping / opening greeting card
      globalLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `${baseUrl}models/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      console.log('Hand tracking initialized successfully with 2 hands support');
      return true;
    } catch (e) {
      console.warn('Hand tracking init fallback to mouse/touch:', e);
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
}

export interface DetailedGestureResult {
  mode: GestureMode;
  isFist: boolean;
  isOpenPalm: boolean;
  isOneFinger: boolean;      // 1 ngón trỏ dơ lên (để lướt ảnh)
  isTwoFingersV: boolean;    // 2 ngón tay chữ V (để hiện thiệp)
  isLockGesture: boolean;    // Ngón số 2 (ngón giữa) + ngón út
  isUnlockGesture: boolean;  // Ngón trỏ + ngón giữa + ngón út
  isTwoHandsClap: boolean;   // 2 bàn tay mở 5 ngón chụp lại
  palmCenter: { x: number; y: number };
  indexTip: { x: number; y: number };
  indexKnuckle: { x: number; y: number };
}

export function analyzeGestures(
  landmarksList: { x: number; y: number; z: number }[][]
): DetailedGestureResult | null {
  if (!landmarksList || landmarksList.length === 0) return null;

  const hand0 = landmarksList[0];

  const getAngle = (
    p1: { x: number; y: number; z: number },
    p2: { x: number; y: number; z: number },
    p3: { x: number; y: number; z: number }
  ) => {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };
    const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
    const rad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
    return (rad * 180) / Math.PI;
  };

  const isFingerExtended = (lm: { x: number; y: number; z: number }[], fingerIdx: number) => {
    let p1, p2, p3;
    if (fingerIdx === 0) {
      p1 = lm[1];
      p2 = lm[2];
      p3 = lm[3];
    } else {
      const offset = fingerIdx * 4;
      p1 = lm[offset + 1];
      p2 = lm[offset + 2];
      p3 = lm[offset + 3];
    }
    const angle = getAngle(p1, p2, p3);
    return angle > 145;
  };

  const fingers0 = [0, 1, 2, 3, 4].map((i) => isFingerExtended(hand0, i));
  const [, index0, middle0, ring0, pinky0] = fingers0;

  const extCount0 = fingers0.filter(Boolean).length;
  const isFist = extCount0 <= 1;
  const isOpenPalm = extCount0 >= 4 && index0 && middle0 && ring0 && pinky0;

  // Cử chỉ 1 ngón trỏ dơ lên (yêu cầu: "chỉ cần 1 ngón dơ qua trái, k cần 5 ngón")
  const isOneFinger = index0 && !middle0 && !ring0 && !pinky0;

  // Cử chỉ 2 ngón tay hình chữ V (Peace / Victory) để xuất hiện thiệp cực kỳ ổn định
  const isTwoFingersV = index0 && middle0 && !ring0 && !pinky0;

  // Cử chỉ chống nhiễu theo yêu cầu:
  // "2 ngón tay là ngón số 2 (tính từ trỏ) và ngón cuối cùng": ngón giữa + ngón út
  const isLockGesture = middle0 && pinky0 && !index0 && !ring0;

  // "để tiếp tục thì dơ 3 ngón như trên + ngón trỏ": ngón trỏ + ngón giữa + ngón út
  const isUnlockGesture = index0 && middle0 && pinky0 && !ring0;

  // Kiểm tra 2 bàn tay chụp lại
  let isTwoHandsClap = false;
  if (landmarksList.length >= 2) {
    const hand1 = landmarksList[1];
    const fingers1 = [0, 1, 2, 3, 4].map((i) => isFingerExtended(hand1, i));
    const isOpenPalm1 = fingers1.filter(Boolean).length >= 4;

    if (isOpenPalm && isOpenPalm1) {
      const dist = Math.hypot(hand0[0].x - hand1[0].x, hand0[0].y - hand1[0].y);
      if (dist < 0.22) {
        isTwoHandsClap = true;
      }
    }
  }

  // Chuyển đổi sang GestureMode cũ để tương thích kiếm trận ThreeJS
  let mode: GestureMode = 'LOTUS';
  if (isFist) mode = 'SHIELD';
  else if (isOpenPalm) mode = 'LOTUS';
  else if (isOneFinger) mode = 'DRAGON';
  else if (index0 && pinky0 && !middle0 && !ring0) mode = 'DAGENG';

  const wrist = hand0[0];
  const middleBase = hand0[9];
  const palmCenter = {
    x: (wrist.x + middleBase.x) / 2,
    y: (wrist.y + middleBase.y) / 2,
  };

  const indexTip = { x: hand0[8].x, y: hand0[8].y };
  const indexKnuckle = { x: hand0[5].x, y: hand0[5].y };

  return {
    mode,
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
  };
}

export function detectGesture(
  landmarks: { x: number; y: number; z: number }[]
): GestureMode {
  const res = analyzeGestures([landmarks]);
  return res ? res.mode : 'LOTUS';
}

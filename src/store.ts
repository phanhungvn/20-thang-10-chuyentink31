import { create } from 'zustand';
import * as THREE from 'three';

const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768;

export const CONFIG = {
  swordCount: isMobile ? 260 : 450,
  pathHistoryLength: 300,
  maxSpeed: 25,
  sprintSpeed: 50,
  steerForce: 28,
  separationDist: 3,
  separationForce: 10,
  noiseScale: 0.3,
  noiseStrength: 1,
  formationRadius: 1.5,
  dragonDensity: 0.8,
  shieldRadius: 10.5,
  shieldOrbitSpeed: 3.2,
  lotusRadius: 24,
  lotusRotateSpeed: 2.5,
  dagengRadius: 30,
  dagengHeight: 20,
  dagengRotateSpeed: 0.2,
};

export type GestureMode = 'DRAGON' | 'SHIELD' | 'LOTUS' | 'DAGENG';
export type PresentationStage = 'IDLE' | 'FIST_ORB' | 'GALLERY' | 'CARD';

export interface PersonProfile {
  id: number;
  label: string;
  name: string;
  role: string;
  wish: string;
  avatarColor: string;
  image?: string;
}

export const PERSON_PROFILES: PersonProfile[] = [
  {
    id: 1,
    label: 'Ảnh 1',
    name: 'Trần Nữ Ngọc Bình',
    role: 'Nữ Thần Tỏa Sáng',
    image: '/photos/photo1.png',
    wish: 'Chúc Ngọc Bình 20/10 luôn rạng ngời như ánh ban mai, hạnh phúc đong đầy và vạn sự như ý!',
    avatarColor: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
  },
  {
    id: 2,
    label: 'Ảnh 2',
    name: 'Từ Phương Nhi',
    role: 'Bông Hồng Dịu Dàng',
    image: '/photos/photo2.jpg',
    wish: 'Chúc Phương Nhi một ngày 20/10 thật ngọt ngào, nhận được ngàn đóa hoa tươi và vạn lời chúc yêu thương!',
    avatarColor: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  },
  {
    id: 3,
    label: 'Ảnh 3',
    name: 'Nguyễn Đặng Đan Thuỳ',
    role: 'Nàng Thơ Tinh Tế',
    image: '/photos/photo3.png',
    wish: 'Chúc Đan Thuỳ luôn tươi vui, tự tin chinh phục mọi ước mơ và luôn giữ nụ cười tỏa nắng trên môi!',
    avatarColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  },
  {
    id: 4,
    label: 'Ảnh 4',
    name: 'Phạm Lê Na',
    role: 'Bá Khí Vương Của Lớp 👑',
    image: '/photos/photo4.jpg',
    wish: 'Chúc Bá Khí Vương Phạm Lê Na mãi mãi uy quyền, khí chất ngút trời, bản lĩnh phi phàm và vạn sự thành công rực rỡ!',
    avatarColor: 'linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%)',
  },
  {
    id: 5,
    label: 'Ảnh 5',
    name: 'Nguyễn Ngọc Bảo An',
    role: 'Ánh Dương Năng Động',
    image: '/photos/photo5.jpg',
    wish: 'Chúc Bảo An ngày càng xinh đẹp, mỗi khoảnh khắc đều ngập tràn niềm vui, tiếng cười và sự an yên!',
    avatarColor: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  },
  {
    id: 6,
    label: 'Ảnh 6',
    name: 'Lương Ngọc Anh',
    role: 'Duyên Dáng & Kiêu Sa',
    image: '/photos/photo6.jpg',
    wish: 'Chúc Ngọc Anh luôn là đóa hoa thơm ngát rực rỡ, được yêu thương và nâng niu trong từng phút giây!',
    avatarColor: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
  },
  {
    id: 7,
    label: 'Ảnh 7',
    name: 'Trần Lê Ngọc Diệp',
    role: 'Nụ Cười Tỏa Nắng',
    image: '/photos/photo7.jpg',
    wish: 'Chúc Ngọc Diệp 20/10 nhận được thật nhiều quà, tình cảm đong đầy và vạn điều như ý!',
    avatarColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  },
  {
    id: 8,
    label: 'Ảnh 8',
    name: 'Nguyễn Hoàng Bảo Ngân',
    role: 'Quý Cô Quyến Rũ',
    image: '/photos/photo8.jpg',
    wish: 'Chúc Bảo Ngân luôn tỏa sáng rực rỡ với đam mê, hạnh phúc viên mãn bên gia đình và người thương!',
    avatarColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
  {
    id: 9,
    label: 'Ảnh 9',
    name: 'Võ Như Ngọc',
    role: 'Viên Ngọc Quý Quý Phái',
    image: '/photos/photo9.jpg',
    wish: 'Chúc Như Ngọc mãi xinh đẹp như viên ngọc sáng ngời, an khang thịnh vượng và hạnh phúc ngập tràn!',
    avatarColor: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  },
];

interface HandState {
  targetPosition: THREE.Vector3;
  isTracking: boolean;
  gestureMode: GestureMode;
  pathHistory: THREE.Vector3[];
  lastDirection: THREE.Vector3;

  // Presentation Features
  stage: PresentationStage;
  currentPhotoIndex: number;
  isLocked: boolean;
  isCardOpened: boolean;
  isFullscreen: boolean;
  hintMessage: string;

  // Real-time Gesture Guidance
  liveGestureLabel: string;
  liveGestureDesc: string;
  activeStep: number; // 1 to 6
  guideCollapsed: boolean;

  // Onboarding & Theme
  hasStarted: boolean;
  showGestureModal: boolean;
  theme: 'light' | 'dark';
  openGestureModal: () => void;
  confirmStart: () => void;
  toggleTheme: () => void;

  setTarget: (pos: THREE.Vector3) => void;
  setTracking: (tracking: boolean) => void;
  setGestureMode: (mode: GestureMode) => void;
  updatePath: (pos: THREE.Vector3) => void;
  extendPath: () => void;

  setStage: (stage: PresentationStage) => void;
  nextPhoto: () => void;
  prevPhoto: () => void;
  setPhotoIndex: (idx: number) => void;
  toggleLock: (locked?: boolean) => void;
  setCardOpened: (opened: boolean) => void;
  toggleFullscreen: () => void;
  setHintMessage: (msg: string) => void;

  setLiveGesture: (label: string, desc: string, step?: number) => void;
  toggleGuide: () => void;
  setGuideCollapsed: (collapsed: boolean) => void;
}

export const useHandStore = create<HandState>((set, get) => ({
  targetPosition: new THREE.Vector3(0, 0, 0),
  isTracking: false,
  gestureMode: 'LOTUS',
  pathHistory: Array.from(
    { length: CONFIG.pathHistoryLength },
    () => new THREE.Vector3(0, 0, 0)
  ),
  lastDirection: new THREE.Vector3(0, 0, 0),

  stage: 'IDLE',
  currentPhotoIndex: 0,
  isLocked: false,
  isCardOpened: false,
  isFullscreen: false,
  hintMessage: '✊ Nắm đấm để ngưng tụ kiếm vào quả cầu hộ thể...',

  // Real-time gesture defaults
  liveGestureLabel: 'Đang chờ bắt đầu buổi lễ...',
  liveGestureDesc: 'Nhấn BẮT ĐẦU BUỔI LỄ để khởi động nhận diện',
  activeStep: 1,
  guideCollapsed: false,

  // Onboarding & Theme defaults
  hasStarted: false,
  showGestureModal: false,
  theme: 'light',
  openGestureModal: () => set({ showGestureModal: true }),
  confirmStart: () => set({ showGestureModal: false, hasStarted: true }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  setTarget: (pos) => set({ targetPosition: pos }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  setGestureMode: (mode) => set({ gestureMode: mode }),

  updatePath: (pos) => {
    const { pathHistory, lastDirection } = get();
    const last = pathHistory[0];
    const diff = pos.clone().sub(last);
    const dist = diff.length();

    if (dist > 0.1) {
      lastDirection.copy(diff.normalize());
      pathHistory.pop();
      pathHistory.unshift(pos.clone());
    }
  },

  extendPath: () => {
    const { pathHistory, lastDirection } = get();
    if (lastDirection.length() < 0.01) return;

    const last = pathHistory[0];
    const newPoint = last
      .clone()
      .add(lastDirection.clone().multiplyScalar(0.3));
    pathHistory.pop();
    pathHistory.unshift(newPoint);
  },

  setStage: (stage) => {
    let mode: GestureMode = 'LOTUS';
    let hint = '';
    let step = 1;
    if (stage === 'FIST_ORB') {
      mode = 'SHIELD';
      hint = '🖐️ Hãy mở 5 ngón tay để mở ra triển lãm 9 bức ảnh!';
      step = 2;
    } else if (stage === 'GALLERY') {
      mode = 'LOTUS';
      hint = '👈 Dơ 1 ngón trỏ lướt qua trái để sang người tiếp theo (1->9)';
      step = 3;
    } else if (stage === 'CARD') {
      mode = 'DAGENG';
      hint = '👐 Dơ 2 bàn tay mở 5 ngón rồi chụp lại để mở thiệp!';
      step = 6;
    } else {
      mode = 'LOTUS';
      hint = '✊ Nắm tay để ngưng tụ kiếm vào quả cầu hộ thể...';
      step = 1;
    }
    set({ stage, gestureMode: mode, hintMessage: hint, activeStep: step });
  },

  nextPhoto: () => {
    const { currentPhotoIndex } = get();
    // Chặn không xoay vòng từ 8 về 0
    if (currentPhotoIndex < PERSON_PROFILES.length - 1) {
      set({ currentPhotoIndex: currentPhotoIndex + 1, activeStep: 3 });
    }
  },

  prevPhoto: () => {
    const { currentPhotoIndex } = get();
    // Chặn TUYỆT ĐỐI không xoay vòng từ 0 nhảy sang 8 (tránh nhảy loạn từ Ảnh 1 sang Ảnh 9)
    if (currentPhotoIndex > 0) {
      set({ currentPhotoIndex: currentPhotoIndex - 1, activeStep: 3 });
    }
  },

  setPhotoIndex: (idx: number) => {
    if (idx >= 0 && idx < PERSON_PROFILES.length) {
      set({ currentPhotoIndex: idx, activeStep: 3 });
    }
  },

  toggleLock: (locked?: boolean) => {
    set((state) => ({
      isLocked: typeof locked === 'boolean' ? locked : !state.isLocked,
    }));
  },

  setCardOpened: (opened: boolean) => set({ isCardOpened: opened }),

  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen().catch(() => {});
      set({ isFullscreen: false });
    }
  },

  setHintMessage: (msg: string) => set({ hintMessage: msg }),

  setLiveGesture: (label: string, desc: string, step?: number) => {
    set((state) => ({
      liveGestureLabel: label,
      liveGestureDesc: desc,
      activeStep: typeof step === 'number' ? step : state.activeStep,
    }));
  },

  toggleGuide: () => set((state) => ({ guideCollapsed: !state.guideCollapsed })),
  setGuideCollapsed: (collapsed: boolean) => set({ guideCollapsed: collapsed }),
}));

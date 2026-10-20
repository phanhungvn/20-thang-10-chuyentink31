# 🌸 ĐẠI TIỆC TÔN VINH PHÁI ĐẸP 20/10 — CHUYÊN TIN K31 🌸
> **Interactive 3D Sword Matrix & AI Gesture-Controlled Celebration Web App**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r170-black.svg?logo=threedotjs)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands_AI-orange.svg?logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?logo=vite)

---

## 📖 GIỚI THIỆU DỰ ÁN

Dự án **Đại Tiệc Tôn Vinh Phái Đẹp 20/10** là một ứng dụng Web 3D tương tác thời gian thực đỉnh cao được xây dựng dành riêng để tri ân và chúc mừng 9 bóng hồng rực rỡ của tập thể **Chuyên Tin K31** nhân ngày Phụ Nữ Việt Nam 20/10.

Kết hợp giữa **Vạn Kiếm Quy Tông (3D Sword Swarm)**, công nghệ thị giác máy tính **AI Hand Tracking (Google MediaPipe)**, phong cách giao diện **Luxurious Executive VIP (Sáng - Sang Trọng)**, và **Phong thư 3D tương tác vỡ sáp mở thiệp siêu thực**, dự án đem lại một sân khấu trình diễn công nghệ vô cùng ấn tượng và giàu cảm xúc.

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT

### 1. ⚔️ Trận Đồ Kiếm Khí 3D (Three.js & React Three Fiber)
- Hàng trăm thanh phi kiếm bằng thép bạc hoàng kim được mô phỏng vật lý chân thực với ánh kim phản chiếu môi trường.
- Kiếm chuyển động mượt mà theo 4 trạng thái: Quả cầu kiếm bảo hộ (*Sword Sphere Shield*), Vạn kiếm hoa sen (*Lotus Bloom*), Kiếm rồng lượn sóng (*Roaming Dragon*), và Bát quái kiếm trận (*Geng Sword Array*).

### 2. 🤖 Điều Khiển Bằng Cử Chỉ Tay AI Thời Gian Thực (MediaPipe)
- Sử dụng mô hình Machine Learning nhận diện 21 khớp bàn tay với độ trễ cực thấp (< 30ms).
- Hệ thống lọc nhiễu thông minh (Debounce chống nhảy ảnh, cơ chế khóa chống người lạ gây nhiễu).

### 3. 👑 Triển Lãm 9 Nữ Thần Chuyên Tin K31 (Executive VIP Showcase)
- Khi lướt đến ai, hệ thống tự động phóng to ảnh chân dung sắc nét bên trái và bảng danh vị, lời chúc trang trọng bên phải.
- **Danh sách 9 bóng hồng K31:**
  1. 🌸 **Trần Nữ Ngọc Bình** — *Nàng Thơ Thanh Lịch & Tinh Tế*
  2. 🌸 **Từ Phương Nhi** — *Đóa Hồng Rực Rỡ & Năng Động*
  3. 🌸 **Nguyễn Đặng Đan Thuỳ** — *Bóng Hồng Dịu Dàng & Trí Tuệ*
  4. 👑 **Phạm Lê Na** — *Bá Khí Vương Của Lớp, Quyền Lực & Khí Chất Ngút Ngàn*
  5. 🌸 **Nguyễn Ngọc Bảo An** — *Ngọt Ngào, Đáng Yêu & Duyên Dáng*
  6. 🌸 **Lương Ngọc Anh** — *Tiểu Thư Tri Thức & Sắc Sảo*
  7. 🌸 **Trần Lê Ngọc Diệp** — *Ánh Trăng Trong Sáng & Dễ Mến*
  8. 🌸 **Nguyễn Hoàng Bảo Ngân** — *Giai Nhân Tài Năng & Cuốn Hút*
  9. 🌸 **Võ Như Ngọc** — *Ngọc Quý Duyên Dáng & Tỏa Sáng*

### 4. 💌 Phong Thư Sáp 3D & Thiệp Chúc Mừng 2K Siêu Nét
- Mô phỏng phong bì thư 3D với con dấu sáp vàng khắc chữ **20/10**.
- Đập hai bàn tay vào nhau để phá dấu sáp, nắp thư mở ra và lá thư tự động vươn cao, phóng to toàn màn hình.
- Nội dung thư được vẽ trên Texture Canvas độ phân giải 2K (2048 x 2560px), hiển thị bài thơ và lời chúc mừng ngày 20/10 trang trọng, ấm áp.
- Hiệu ứng pháo hoa Confetti hoàng kim cùng dàn nhạc giao hưởng Web Audio Synth tự động kích hoạt.

---

## 🎮 HƯỚNG DẪN CỬ CHỈ BIỂU DIỄN

Hệ thống hỗ trợ bảng cử chỉ trực quan theo thứ tự kịch bản biểu diễn:

| Cử chỉ | Biểu tượng | Mô tả động tác | Hiệu ứng hệ thống |
|:---|:---:|:---|:---|
| **Nắm tay** | ✊ | Nắm chặt bàn tay thành nắm đấm | Thu vạn kiếm tạo thành **Quả Cầu Kiếm Khí** bảo hộ. |
| **Xòe 5 ngón** | ✋ | Xòe rộng 5 ngón tay hướng về camera | Mở ra **Phòng Triển Lãm 9 Ảnh Mỹ Nhân K31**. |
| **Lướt 1 ngón** | ☝️ | Giơ 1 ngón trỏ và vung nhẹ sang trái/phải | Chuyển tiếp mượt mà đến từng bức ảnh và lời chúc tiếp theo. |
| **Khóa chống nhiễu** | ✌️ | Giơ 2 ngón (ngón giữa + ngón út) | Tạm khóa thao tác (tránh người khác vô tình làm nhảy tín hiệu). |
| **Mở khóa tiếp tục**| 🤟 | Giơ 3 ngón (ngón trỏ + ngón giữa + ngón út) | Mở khóa và tiếp tục điều khiển chương trình. |
| **Vẽ chữ nhật** | 🔲 | Dùng ngón trỏ quét tạo hình chữ nhật | Triệu hồi **Phong Thư Hoàng Gia 3D** xuất hiện giữa không trung. |
| **Vỗ hai tay** | 👏 | Đưa 2 bàn tay vỗ / chạm vào nhau | Phá vỡ con dấu sáp, **Mở phong thư** và đọc toàn văn bức thiệp 20/10! |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **3D Graphics & Shaders:** [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- **Computer Vision & AI:** [@mediapipe/camera_utils](https://developers.google.com/mediapipe), [@mediapipe/hands](https://google.github.io/mediapipe/solutions/hands.html)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Visual FX & Audio:** `canvas-confetti`, Web Audio API Synthesizer (tổng hợp âm thanh nhạc chuông vàng thời gian thực)
- **Deployment & Server:** Docker, Docker Compose, Nginx Alpine

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
- Node.js >= 18.0.0
- npm hoặc pnpm
- Thiết bị có Webcam hoạt động tốt và đủ ánh sáng

### 2. Chạy trên môi trường Local (Development)
```bash
# 1. Clone repository
git clone git@github.com:phanhungvn/20-thang-10-chuyentink31.git
cd 20-thang-10-chuyentink31

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi động máy chủ phát triển
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:5173`

### 3. Đóng gói ứng dụng (Build Production)
```bash
npm run build
```
Mã nguồn tĩnh tối ưu sẽ được tạo tại thư mục `dist/`.

### 4. Triển khai bằng Docker (Production Ready)
Dự án đã tích hợp sẵn Dockerfile đa tầng (Multi-stage build) và Nginx:
```bash
# Khởi động dịch vụ trong nền
docker compose up -d --build

# Kiểm tra trạng thái
docker compose ps
```
Ứng dụng sẽ hoạt động tại cổng `80` (hoặc cổng được ánh xạ theo cấu hình server).

---

## 📁 CẤU TRÚC DỰ ÁN

```text
├── public/
│   ├── photos/               # Ảnh chân dung 9 mỹ nhân Chuyên Tin K31
│   │   ├── photo1.png
│   │   └── photo2.jpg ... photo9.jpg
│   └── models/               # 3D models (kiếm, hiệu ứng)
├── src/
│   ├── components/
│   │   ├── CameraController.tsx  # Điều khiển góc máy camera 3D mượt mà
│   │   ├── GreetingCard3D.tsx    # Phong thư 3D sáp nến & Thiệp chúc mừng 2K
│   │   ├── HandController.tsx    # Nhận diện cử chỉ MediaPipe & Xử lý tracking
│   │   ├── PhotoGallery3D.tsx    # Vòng tròn 3D trưng bày 9 ảnh nghệ thuật
│   │   ├── SwordSwarm.tsx        # Hệ thống kiếm trận Three.js
│   │   └── SoundEffects.ts       # Bộ tổng hợp âm thanh Web Audio API
│   ├── store.ts                  # Quản lý trạng thái ứng dụng (Zustand) & Hồ sơ K31
│   ├── App.tsx                   # Giao diện chính, Thanh điều khiển, Modal hướng dẫn
│   └── main.tsx                  # Điểm khởi chạy React
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── README.md
```

---

## 💖 LỜI TRI ÂN

> Kính gửi 9 bóng hồng của đại gia đình **Chuyên Tin K31**,
> 
> Chúc các bạn luôn xinh đẹp, tự tin, rạng rỡ và luôn là nguồn cảm hứng bất tận của tập thể lớp! Chúc mừng Ngày Phụ Nữ Việt Nam 20/10 thật nhiều niềm vui và hạnh phúc! 💐✨

---
*Phát triển bởi Tập thể Chuyên Tin K31 — 20/10*

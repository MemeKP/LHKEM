# LHKEM - Loeng Him Kaw Community Platform

โครงการแพลตฟอร์มชุมชนเลิงหิมขาว สำหรับการจัดการเวิร์กช็อป แผนที่ชุมชน และข้อมูลร้านค้าท้องถิ่น

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
- [Environment Variables](#environment-variables)

## 🔧 Prerequisites

ก่อนเริ่มต้น ต้องติดตั้งโปรแกรมเหล่านี้ก่อน:

- **Node.js** (v18 หรือสูงกว่า) - [Download](https://nodejs.org/)
- **npm** (มากับ Node.js)
- **Docker** และ **Docker Compose** (สำหรับรัน MongoDB) - [Download](https://www.docker.com/)
- **Git** - [Download](https://git-scm.com/)

## 📦 Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd LHKEM
```

### 2. Install Dependencies

#### Root Level (สำหรับ Tailwind CSS)
```bash
npm install
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 3. Setup Environment Variables

#### Backend Environment
สร้างไฟล์ `.env` ใน `backend/` โดยคัดลอกจาก `.env.example`:

```bash
cd backend
cp .env.example .env
```

แก้ไขค่าใน `.env` ตามต้องการ:
```env
PORT=3000
MONGODB_URI=mongodb://root:password@localhost:27017/lhkem?authSource=admin
JWT_SECRET=your-secret-key-here
```

#### Frontend Environment (ถ้ามี)
สร้างไฟล์ `.env` ใน `frontend/` ถ้าจำเป็น:

```bash
cd frontend
# สร้าง .env ถ้าต้องการ
```

## 🚀 Running the Application
### Option 1: Development Mode (แนะนำ)

#### 1. Start MongoDB with Docker
```bash
docker-compose up -d
```

#### 2. Start Backend Server
```bash
cd backend
npm run start:dev
```
Backend จะรันที่: `http://localhost:3000`

#### 3. Start Frontend Development Server
เปิด terminal ใหม่:
```bash
cd frontend
npm run dev
```
Frontend จะรันที่: `http://localhost:5173`

### Option 2: Production Build

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Build Backend
```bash
cd backend
npm run build
npm start
```

## 🗄️ Database Setup

### Start MongoDB Container (using Docker)

```bash
docker-compose up -d 
```

### Verify MongoDB is Working
1. Check running containers:
```bash
docker ps
```
2. Access MongoDB container:
```bash
docker exec -it mongodb bash
```
3. Connect to MongoDB shell:
```bash
mongosh -u root -p
```
When prompted, enter the password: password
4. Show databases:
```bash
show dbs
```
Expected Output:
```bash
admin   100.00 KiB
config   72.00 KiB
lhkem    80.00 KiB
local    72.00 KiB
```
If you see the lhkem database, MongoDB is working correctly :)

### Stop MongoDB Container
```bash
docker-compose down
```

### MongoDB Atlas (Alternative)
คุณสามารถใช้ MongoDB Atlas แทน Docker ได้:
1. สร้างบัญชีที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. สร้าง Cluster ใหม่
3. คัดลอก Connection String
4. แก้ไข `MONGODB_URI` ใน `backend/.env`

<div align="center">
  <img src="https://ik.imagekit.io/496kiwiBird/Screenshot%202025-12-22%20204455.png?updatedAt=1766411152205" width="auto">
</div>

## 📁 Project Structure

```
LHKEM/
├── backend/                 # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── ...
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Context API (Language)
│   │   ├── hooks/         # Custom hooks
│   │   ├── locales/       # Translation files (TH/EN)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
│
├── docker-compose.yml      # MongoDB container config
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## ✨ Features

### Frontend Features
- 🌐 **Bilingual System** - รองรับภาษาไทยและอังกฤษ
- 🎨 **Modern UI** - ใช้ Tailwind CSS และ shadcn/ui
- ✨ **Smooth Animations** - Animations ที่นุ่มนวลและสวยงาม
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- 🗺️ **Interactive Map** - แผนที่ชุมชนแบบ interactive
- 🎓 **Workshop Management** - ระบบจัดการเวิร์กช็อป
- 🔐 **Authentication** - ระบบ Login/Register/OTP

### Backend Features
- 🔒 **JWT Authentication** - ระบบยืนยันตัวตนด้วย JWT
- 📊 **RESTful API** - API ที่เป็นมาตรฐาน
- 🗄️ **MongoDB Integration** - ฐานข้อมูล NoSQL
- ⚡ **Express.js** - Framework ที่รวดเร็วและยืดหยุ่น

## 🌍 Environment Variables

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://root:password@localhost:27017/lhkem?authSource=admin

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:3000
```

## 🛠️ Available Scripts

### Root
```bash
npm install              # Install Tailwind dependencies
```

### Frontend
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Backend
```bash
npm run start:dev       # Start with nodemon (auto-reload)
npm run build           # Build TypeScript
npm start               # Start production server
```

## 🐛 Troubleshooting

### Port Already in Use
ถ้า port 3000 หรือ 5173 ถูกใช้งานอยู่:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- ตรวจสอบว่า Docker container กำลังรันอยู่: `docker ps`
- ตรวจสอบ `MONGODB_URI` ใน `.env`
- ลอง restart container: `docker-compose restart`

### Module Not Found
```bash
# ลบ node_modules และ install ใหม่
rm -rf node_modules package-lock.json
npm install
```

## 📝 Git Best Practices

### ไฟล์ที่ไม่ควร commit
- `node_modules/` - Dependencies
- `dist/` หรือ `build/` - Build outputs
- `.env` - Environment variables (ใช้ `.env.example` แทน)
- `*.log` - Log files

### คำสั่ง Git ที่ปลอดภัย
```bash
# ดูสถานะไฟล์
git status

# Add เฉพาะไฟล์ที่ต้องการ
git add frontend/src backend/src

# หรือ add ทั้งหมดยกเว้นที่ ignore
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

## 👥 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

Project Link: [https://github.com/yourusername/LHKEM](https://github.com/yourusername/LHKEM)

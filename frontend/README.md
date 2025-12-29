# LHKEM Frontend (React + Vite)

ส่วนติดต่อผู้ใช้ของโครงการ “Loeng Him Kaw Community Platform” สร้างด้วย React, Vite และ Tailwind CSS โดยมีระบบสองภาษา (ไทย/อังกฤษ), Context API, และเอฟเฟกต์ Animation ที่นุ่มนวล

## ✨ Features
- 🌐 **Bilingual UI** – ใช้ `src/locales/en.json` และ `src/locales/th.json` พร้อม `LanguageContext`
- 🎨 **Tailwind + Custom Animations** – คลาส `animate-fadeIn`, `animate-slideUp`, `animate-stagger`, ฯลฯ ใน `src/index.css`
- 🧭 **Active Navbar** – ไฮไลท์หน้าปัจจุบันทั้ง desktop/mobile
- 📱 **Responsive Layout** – รองรับทั้ง desktop และ mobile
- 🔐 **Auth Pages** – Login, Register, Verify OTP พร้อมแอนิเมชัน
- 🗺️ **Map & Workshops** – ดึงข้อมูลจากภาษาและมี subtle motion

## 🔧 Prerequisites
- Node.js 18+
- npm (มากับ Node.js)

## 📦 Installation
```bash
# จากโฟลเดอร์ root ของโปรเจค
cd frontend
npm install
```

## ⚙️ Environment Variables
ไฟล์ `.env` (ถ้าจำเป็น)
```env
VITE_API_URL=http://localhost:3000
```

ไม่มีการ commit ไฟล์ `.env` ให้ใช้งานเฉพาะเครื่องตัวเองเท่านั้น

## 🚀 Running
```bash
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build (ไฟล์อยู่ใน dist/)
npm run preview  # Preview production build
npm run lint     # ตรวจสอบโค้ดด้วย ESLint
```

## 🌐 Working with Translations
1. แก้ไขข้อความใน `src/locales/en.json` หรือ `src/locales/th.json`
2. ใช้ hook `useTranslation`:
   ```jsx
   import { useTranslation } from '../hooks/useTranslation';
   const { t } = useTranslation();
   <h1>{t('home.hero.title')}</h1>
   ```
3. หากต้องการสลับภาษา ให้เรียก `toggleLanguage` จาก `LanguageContext`

## ✨ Animation Guidelines
- ใส่ `animate-fadeIn` ให้ container หลักของแต่ละหน้า
- ใช้ `animate-slideUp`/`slideDown` สำหรับ title หรือ section header
- ใช้ `animate-stagger` สำหรับ card/grid ที่ต้องการให้แสดงทีละชิ้น
- ปุ่มสำคัญใช้ `transition-all` และ `hover:scale-105` เพื่อเพิ่มความ lively

## 🧱 Directory Overview
```
src/
├── components/          # Navbar, Footer, LoadingSpinner, ฯลฯ
├── contexts/            # LanguageContext
├── hooks/               # useTranslation
├── layouts/             # MainLayout
├── locales/             # en.json, th.json
├── pages/               # Home, Map, Workshops, Auth pages
├── services/            # API service wrappers
└── index.css            # Tailwind + custom animations
```

## 🛠 Troubleshooting
- **Port 5173 ซ้ำ** – ปิด dev server ตัวอื่น หรือเปลี่ยนพอร์ตด้วย `npm run dev -- --port=5174`
- **Translation หาย** – ตรวจว่ามี key ตรงกันในทั้งสองไฟล์ `locales`
- **Animation ไม่ทำงาน** – ตรวจว่ามี import `src/index.css` และใช้คลาสถูกต้อง

## 🤝 Contributing
1. สร้าง branch ใหม่ (`feat/<name>`)
2. รัน `npm run lint` ก่อน commit
3. เปิด Pull Request พร้อมแนบภาพหน้าจอ (ถ้าเป็น UI)

---
หากมีคำถามเพิ่มเติม ดูตัวอย่างการใช้งานในไฟล์หน้า Home, Map และ Workshops ซึ่งรวมระบบแปลภาษาและแอนิเมชันครบถ้วนแล้ว 💪

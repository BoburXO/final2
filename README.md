# 🛍️ ShopBot — Full Stack Online Do'kon + Telegram Bot

**React + Node.js + MongoDB + Telegraf.js** asosida qurilgan to'liq funksional e-commerce loyiha.

---

## 📋 Texnologiyalar

| Qism       | Stack                                     |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Zustand     |
| Backend    | Node.js, Express.js                       |
| Ma'lumotlar bazasi | MongoDB, Mongoose               |
| Auth       | JWT, bcryptjs                             |
| Telegram Bot | Telegraf.js                             |
| Deploy     | Netlify (frontend), Render (backend), MongoDB Atlas |

---

## 📂 Loyiha tuzilmasi

```
shopbot/
├── backend/
│   ├── bot/index.js          # Telegram bot (barcha buyruqlar)
│   ├── controllers/          # Biznes mantiq
│   ├── middleware/           # Auth va Admin tekshiruv
│   ├── models/               # User, Product, Order sxemalari
│   ├── routes/               # API yo'llari
│   ├── scripts/seed.js       # Test ma'lumotlari
│   └── server.js             # Asosiy server
└── frontend/
    └── src/
        ├── api/              # Axios instance + barcha API chaqiruvlar
        ├── components/       # Navbar, ProductCard, ProtectedRoute...
        ├── pages/            # Sahifalar
        │   └── admin/        # Admin panel sahifalari
        └── store/            # Zustand state management
```

---

## 🚀 Loyihani ishga tushirish

### 1. Talablar
- Node.js 18+
- MongoDB Atlas hisob (bepul tier ishlaydi)
- Telegram Bot token (BotFather dan)

### 2. Backend sozlash

```bash
cd backend
npm install
cp .env.example .env
# .env faylini to'ldiring (quyida ko'rsatilgan)
```

**`.env` fayl:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/shopbot
JWT_SECRET=sizning_maxfiy_kalit
BOT_TOKEN=BotFather_dan_olingan_token
ADMIN_TELEGRAM_IDS=sizning_telegram_id
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

**Test ma'lumotlarini yuklash:**
```bash
npm run seed
# Admin: admin@shopbot.uz / admin123
# User:  user@shopbot.uz  / user123
```

**Serverni ishga tushirish:**
```bash
npm run dev        # Development
npm start          # Production
```

### 3. Frontend sozlash

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL va VITE_BOT_USERNAME ni to'ldiring
npm run dev
```

---

## 🔌 API Endpointlar

### Auth (`/api/auth`)
| Method | URL             | Auth | Tavsif              |
|--------|-----------------|------|---------------------|
| POST   | /register       | —    | Ro'yxatdan o'tish   |
| POST   | /login          | —    | Kirish              |
| GET    | /me             | ✅   | Joriy foydalanuvchi |
| PUT    | /profile        | ✅   | Profilni yangilash  |

### Products (`/api/products`)
| Method | URL    | Auth  | Tavsif             |
|--------|--------|-------|--------------------|
| GET    | /      | —     | Mahsulotlar ro'yxati (qidiruv, filtr, sahifalar) |
| GET    | /:id   | —     | Bir mahsulot       |
| POST   | /      | 👑    | Mahsulot yaratish  |
| PUT    | /:id   | 👑    | Mahsulot yangilash |
| DELETE | /:id   | 👑    | Mahsulot o'chirish |

### Orders (`/api/orders`)
| Method | URL    | Auth | Tavsif                |
|--------|--------|------|-----------------------|
| POST   | /      | ✅   | Buyurtma berish       |
| GET    | /      | ✅   | Mening buyurtmalarim  |
| GET    | /:id   | ✅   | Bitta buyurtma        |

### Admin (`/api/admin`)
| Method | URL                    | Auth | Tavsif               |
|--------|------------------------|------|----------------------|
| GET    | /stats                 | 👑   | Statistika           |
| GET    | /users                 | 👑   | Foydalanuvchilar     |
| PUT    | /users/:id/role        | 👑   | Rolni o'zgartirish   |
| GET    | /orders                | 👑   | Barcha buyurtmalar   |
| PUT    | /orders/:id/status     | 👑   | Status yangilash     |
| POST   | /broadcast             | 👑   | Telegram xabar       |

> ✅ = Foydalanuvchi tokeni kerak | 👑 = Admin tokeni kerak

---

## 📱 Telegram Bot Buyruqlari

### Foydalanuvchi
| Buyruq | Tavsif |
|--------|--------|
| `/start` | Botni ishga tushirish |
| `/help` | Yordam |
| `/info` | Profil ma'lumotlari |
| `/products` | Mahsulotlar ro'yxati |

### Admin (faqat ADMIN_TELEGRAM_IDS da ko'rsatilganlarga)
| Buyruq | Tavsif |
|--------|--------|
| `/admin` | Admin panel (inline keyboard) |
| `/stats` | Statistika |
| `/users` | Foydalanuvchilar |
| `/broadcast` | Barcha Telegram foydalanuvchilarga xabar |

---

## ☁️ Deploy

### Backend → Render.com
1. GitHub ga push qiling
2. Render.com da yangi "Web Service" yarating
3. Environment variables ni kiriting
4. `npm start` start command

### Frontend → Netlify
1. `cd frontend && npm run build`
2. Netlify da yangi sayt yarating
3. `dist/` papkasini drag & drop qiling
4. `VITE_API_URL` ni Render URL ga o'zgartiring

### MongoDB Atlas
1. mongodb.com/atlas da bepul cluster yarating
2. IP whitelist: `0.0.0.0/0` (barcha IP)
3. Connection string ni `.env` ga kiriting

---

## 🌟 Funksiyalar

### Foydalanuvchi
- [x] Ro'yxatdan o'tish va kirish (JWT)
- [x] Mahsulotlarni ko'rish, qidirish, filtr
- [x] Savatga qo'shish (localStorage da saqlanadi)
- [x] Buyurtma berish (manzil + telefon)
- [x] Buyurtmalar tarixini ko'rish
- [x] Profilni yangilash

### Admin
- [x] Dashboard (statistika kartalar + so'nggi buyurtmalar)
- [x] Mahsulot CRUD (qo'shish, tahrirlash, o'chirish)
- [x] Buyurtmalarni ko'rish + status yangilash
- [x] Foydalanuvchilarni ko'rish + rol boshqaruvi
- [x] Telegram orqali broadcast xabar

### Telegram Bot
- [x] Mahsulotlarni inline keyboard bilan ko'rsatish
- [x] Foydalanuvchi buyurtmalarini ko'rish
- [x] Admin panel (statistika, foydalanuvchilar, buyurtmalar)
- [x] Yangi ro'yxatdan o'tishda admin xabardor qilish
- [x] Yangi buyurtmada admin xabardor qilish
- [x] Buyurtma status o'zgarganda foydalanuvchi xabardor qilish
- [x] Broadcast xabar yuborish

---

## 📝 Litsenziya

MIT © 2024 ShopBot

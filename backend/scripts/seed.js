/**
 * Seed script — test ma'lumotlarini bazaga yuklaydi
 * Ishlatish: node scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'Apple\'ning 2024 yildagi eng kuchli smartfoni. A17 Pro chip, titanium korpus.',
    price: 14500000,
    category: 'Elektronika',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'S Pen bilan birga keluvchi premium Android telefon.',
    price: 11200000,
    category: 'Elektronika',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
  },
  {
    name: 'MacBook Air M3',
    description: 'Engil va kuchli laptop. 18 soatlik batareya.',
    price: 19800000,
    category: 'Elektronika',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1611186871525-4e3be15e7a7b?w=400',
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Dunyoning eng yaxshi noise-cancelling quloqchini.',
    price: 3800000,
    category: 'Elektronika',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
  },
  {
    name: 'Nike Air Max 270',
    description: 'Kundalik foydalanish uchun ideal sport poyabzal.',
    price: 980000,
    category: 'Sport',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    name: 'Adidas Ultraboost 23',
    description: 'Yugurishchilarga mo\'ljallangan professional poyabzal.',
    price: 1150000,
    category: 'Sport',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400',
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Klassik ko\'k jins. Har doim moda.',
    price: 420000,
    category: 'Kiyim',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
  },
  {
    name: 'Dyson V15 Detect',
    description: 'Lazerli cho\'tka bilan zangori changxo\'r.',
    price: 5500000,
    category: 'Uy-ro\'zg\'or',
    stock: 7,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ulandi\n');

    // Mavjud ma'lumotlarni o'chirish
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Eski ma\'lumotlar o\'chirildi');

    // Admin yaratish
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@shopbot.uz',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`✅ Admin: ${admin.email} / admin123`);

    // Test foydalanuvchi yaratish
    const user = await User.create({
      name: 'Test Foydalanuvchi',
      email: 'user@shopbot.uz',
      password: 'user123',
    });
    console.log(`✅ User: ${user.email} / user123`);

    // Mahsulotlarni yuklash
    await Product.insertMany(products);
    console.log(`✅ ${products.length} ta mahsulot yaratildi`);

    console.log('\n🎉 Baza muvaffaqiyatli to\'ldirildi!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed xatosi:', err.message);
    process.exit(1);
  }
}

seed();

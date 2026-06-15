require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', time: new Date().toISOString() })
);

// ─── Bot Webhook (production) ─────────────────────────────────────────────────
let botModule;
if (process.env.NODE_ENV === 'production' && process.env.BOT_TOKEN) {
  botModule = require('./bot');
  app.use(`/bot${process.env.BOT_TOKEN}`, botModule.bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
}

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route topilmadi' }));

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server ichki xatosi' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB ulandi');

    app.listen(PORT, () => {
      console.log(`✅ Server port ${PORT} da ishlayapti`);
    });

    // Telegram Bot ni ishga tushirish
    if (process.env.BOT_TOKEN) {
      const { startBot } = require('./bot');
      await startBot();
    } else {
      console.warn('⚠️  BOT_TOKEN topilmadi - Telegram bot o\'chirilgan');
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB ulanmadi:', err.message);
    process.exit(1);
  });

module.exports = app;

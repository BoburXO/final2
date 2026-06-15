const { Telegraf, session, Markup } = require('telegraf');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// ─── Bot instance ─────────────────────────────────────────────────────────────
const bot = new Telegraf(process.env.BOT_TOKEN || 'REPLACE_BOT_TOKEN');

// Admin Telegram IDlar
const getAdminIds = () =>
  (process.env.ADMIN_TELEGRAM_IDS || '').split(',').filter(Boolean).map(Number);

const isAdmin = (telegramId) => getAdminIds().includes(Number(telegramId));

// ─── Helper functions ─────────────────────────────────────────────────────────
const notifyAdmin = async (text) => {
  for (const adminId of getAdminIds()) {
    try {
      await bot.telegram.sendMessage(adminId, text);
    } catch (_) {}
  }
};

const sendMessage = async (telegramId, text) => {
  try {
    await bot.telegram.sendMessage(telegramId, text);
  } catch (_) {}
};

const broadcastToAll = async (text, telegramIds) => {
  let sent = 0;
  let failed = 0;
  for (const id of telegramIds) {
    try {
      await bot.telegram.sendMessage(id, text);
      sent++;
      // Rate limiting
      await new Promise((r) => setTimeout(r, 50));
    } catch (_) {
      failed++;
    }
  }
  return { sent, failed };
};

// ─── Session middleware ───────────────────────────────────────────────────────
bot.use(session());

// ─── Asosiy klaviaturalar ─────────────────────────────────────────────────────
const userKeyboard = Markup.keyboard([
  ['📦 Mahsulotlar', '🛒 Buyurtmalarim'],
  ['👤 Profilim', '📞 Aloqa'],
]).resize();

const adminKeyboard = Markup.keyboard([
  ['📦 Mahsulotlar', '🛒 Buyurtmalarim'],
  ['👤 Profilim', '📞 Aloqa'],
  ['🔧 Admin panel'],
]).resize();

// ─── /start ───────────────────────────────────────────────────────────────────
bot.start(async (ctx) => {
  const { id, first_name, username } = ctx.from;

  // Foydalanuvchi ma'lumotlarini yangilash
  try {
    await User.findOneAndUpdate(
      { telegramId: id },
      { telegramUsername: username || null },
      { new: true }
    );
  } catch (_) {}

  const keyboard = isAdmin(id) ? adminKeyboard : userKeyboard;

  await ctx.reply(
    `Assalomu alaykum, ${first_name}! 👋\n\n` +
    `🛍️ *ShopBot Online Do'koniga xush kelibsiz!*\n\n` +
    `Mahsulotlarimizni ko'ring, buyurtma bering va buyurtmalaringizni kuzating.\n\n` +
    `Saytimiz: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`,
    { parse_mode: 'Markdown', ...keyboard }
  );
});

// ─── /help ────────────────────────────────────────────────────────────────────
bot.help(async (ctx) => {
  const adminText = isAdmin(ctx.from.id)
    ? `\n\n🔧 *Admin buyruqlari:*\n` +
      `/admin — Admin panel\n` +
      `/stats — Statistika\n` +
      `/users — Foydalanuvchilar\n` +
      `/broadcast — Xabar yuborish`
    : '';

  await ctx.reply(
    `📋 *Mavjud buyruqlar:*\n\n` +
    `/start — Botni ishga tushirish\n` +
    `/help — Yordam\n` +
    `/info — Profilim\n` +
    `/products — Mahsulotlar ro'yxati` +
    adminText,
    { parse_mode: 'Markdown' }
  );
});

// ─── /info ────────────────────────────────────────────────────────────────────
bot.command('info', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });

  if (!user) {
    return ctx.reply(
      `❌ Siz hali saytda ro'yxatdan o'tmagansiz!\n\n` +
      `👉 Ro'yxatdan o'ting: ${process.env.FRONTEND_URL}/register`
    );
  }

  const ordersCount = await Order.countDocuments({ user: user._id });

  await ctx.reply(
    `👤 *Profilingiz:*\n\n` +
    `📛 Ism: ${user.name}\n` +
    `📧 Email: ${user.email}\n` +
    `🎭 Rol: ${user.role === 'admin' ? 'Admin 👑' : 'Foydalanuvchi'}\n` +
    `📦 Buyurtmalar: ${ordersCount} ta\n` +
    `📅 Ro'yxatdan: ${new Date(user.createdAt).toLocaleDateString('uz-UZ')}`,
    { parse_mode: 'Markdown' }
  );
});

bot.hears('👤 Profilim', async (ctx) => ctx.replyWithMarkdown(
  `👤 Profilni to'liq ko'rish uchun:`,
  Markup.inlineKeyboard([[Markup.button.url('🌐 Profilga o\'tish', `${process.env.FRONTEND_URL}/profile`)]])
));

// ─── Mahsulotlar ──────────────────────────────────────────────────────────────
bot.command('products', showProducts);
bot.hears('📦 Mahsulotlar', showProducts);

async function showProducts(ctx) {
  const products = await Product.find({ isActive: true }).limit(8);

  if (products.length === 0) {
    return ctx.reply('😕 Hozircha mahsulotlar mavjud emas');
  }

  const buttons = products.map((p) => [
    Markup.button.callback(
      `${p.name} — ${p.price.toLocaleString()} so'm`,
      `prod_${p._id}`
    ),
  ]);
  buttons.push([Markup.button.callback('🌐 Saytda barchasini ko\'rish', 'goto_site')]);

  await ctx.reply('📦 *Mahsulotlarimiz:*', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons),
  });
}

bot.action(/^prod_(.+)$/, async (ctx) => {
  const product = await Product.findById(ctx.match[1]);
  if (!product) return ctx.answerCbQuery('Mahsulot topilmadi');

  await ctx.answerCbQuery();
  await ctx.reply(
    `📦 *${product.name}*\n\n` +
    `💰 Narxi: ${product.price.toLocaleString()} so'm\n` +
    `📝 ${product.description}\n` +
    `📊 Omborda: ${product.stock > 0 ? product.stock + ' ta' : 'Tugagan ❌'}\n` +
    `🏷️ Kategoriya: ${product.category}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🛒 Buyurtma berish', `${process.env.FRONTEND_URL}/products`)],
      ]),
    }
  );
});

bot.action('goto_site', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '🌐 Barcha mahsulotlarni saytda ko\'ring:',
    Markup.inlineKeyboard([[Markup.button.url('🛍️ Saytga o\'tish', `${process.env.FRONTEND_URL}/products`)]])
  );
});

// ─── Buyurtmalar ──────────────────────────────────────────────────────────────
bot.hears('🛒 Buyurtmalarim', async (ctx) => {
  const user = await User.findOne({ telegramId: ctx.from.id });
  if (!user) {
    return ctx.reply(`❌ Avval ro'yxatdan o'ting: ${process.env.FRONTEND_URL}/register`);
  }

  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);

  if (orders.length === 0) {
    return ctx.reply('📭 Hali buyurtma berilmagan');
  }

  const emoji = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📬', cancelled: '❌' };
  const labels = { pending: 'Kutilmoqda', confirmed: 'Tasdiqlandi', shipped: 'Yo\'lda', delivered: 'Yetkazildi', cancelled: 'Bekor' };

  let text = `📦 *So'nggi buyurtmalaringiz:*\n\n`;
  orders.forEach((o, i) => {
    text += `${i + 1}. ${emoji[o.status]} ${labels[o.status]}\n`;
    text += `   💰 ${o.totalAmount.toLocaleString()} so'm\n`;
    text += `   📅 ${new Date(o.createdAt).toLocaleDateString('uz-UZ')}\n\n`;
  });

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.url('🌐 Barchasini ko\'rish', `${process.env.FRONTEND_URL}/profile`)]]),
  });
});

// ─── Aloqa ────────────────────────────────────────────────────────────────────
bot.hears('📞 Aloqa', async (ctx) => {
  await ctx.reply(
    `📞 *Biz bilan bog'laning:*\n\n` +
    `📧 Email: support@shopbot.uz\n` +
    `📱 Telefon: +998 90 000 00 00\n` +
    `🕐 Ish vaqti: 9:00 - 18:00`,
    { parse_mode: 'Markdown' }
  );
});

// ─── ADMIN SECTION ────────────────────────────────────────────────────────────
bot.hears('🔧 Admin panel', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('❌ Ruxsat yo\'q');
  await sendAdminMenu(ctx);
});

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('❌ Bu buyruq faqat adminlar uchun');
  await sendAdminMenu(ctx);
});

async function sendAdminMenu(ctx) {
  await ctx.reply(
    '🔧 *Admin Panel*\nQuyidagilardan birini tanlang:',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Statistika', 'a_stats')],
        [Markup.button.callback('👥 Foydalanuvchilar', 'a_users')],
        [Markup.button.callback('📦 Buyurtmalar', 'a_orders')],
        [Markup.button.callback('📢 Xabar yuborish', 'a_broadcast')],
        [Markup.button.url('🌐 Admin Panelni ochish', `${process.env.FRONTEND_URL}/admin`)],
      ]),
    }
  );
}

// Admin callbacks
bot.action('a_stats', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('❌ Ruxsat yo\'q');
  await ctx.answerCbQuery();
  await showStats(ctx);
});

bot.action('a_users', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('❌ Ruxsat yo\'q');
  await ctx.answerCbQuery();

  const users = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
  let text = `👥 *So'nggi 10 ta foydalanuvchi:*\n\n`;
  users.forEach((u, i) => {
    text += `${i + 1}. ${u.role === 'admin' ? '👑' : '👤'} ${u.name}\n   ${u.email}\n`;
    if (u.telegramId) text += `   📱 @${u.telegramUsername || u.telegramId}\n`;
    text += '\n';
  });

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Orqaga', 'a_back')]]),
  });
});

bot.action('a_orders', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('❌ Ruxsat yo\'q');
  await ctx.answerCbQuery();

  const orders = await Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(10);
  const emoji = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📬', cancelled: '❌' };

  let text = `📦 *So'nggi buyurtmalar:*\n\n`;
  orders.forEach((o, i) => {
    text += `${i + 1}. ${emoji[o.status]} ${o.user?.name || 'N/A'}\n`;
    text += `   💰 ${o.totalAmount.toLocaleString()} so'm\n\n`;
  });

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Orqaga', 'a_back')]]),
  });
});

bot.action('a_broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('❌ Ruxsat yo\'q');
  await ctx.answerCbQuery();

  ctx.session = ctx.session || {};
  ctx.session.awaitingBroadcast = true;
  await ctx.reply('📢 Barcha telegram foydalanuvchilarga yuboriladigan xabarni yozing:\n\n/cancel — bekor qilish');
});

bot.action('a_back', async (ctx) => {
  await ctx.answerCbQuery();
  await sendAdminMenu(ctx);
});

// /stats command
bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('❌ Bu buyruq faqat adminlar uchun');
  await showStats(ctx);
});

async function showStats(ctx) {
  const [users, products, orders, revenue, pending] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
  ]);

  await ctx.reply(
    `📊 *Statistika:*\n\n` +
    `👥 Foydalanuvchilar: ${users}\n` +
    `📦 Mahsulotlar: ${products}\n` +
    `🛒 Buyurtmalar: ${orders}\n` +
    `⏳ Kutilayotgan: ${pending}\n` +
    `💰 Daromad: ${(revenue[0]?.total || 0).toLocaleString()} so'm`,
    { parse_mode: 'Markdown' }
  );
}

// /users command
bot.command('users', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('❌ Bu buyruq faqat adminlar uchun');

  const total = await User.countDocuments();
  const admins = await User.countDocuments({ role: 'admin' });
  const tgUsers = await User.countDocuments({ telegramId: { $ne: null } });

  await ctx.reply(
    `👥 *Foydalanuvchilar:*\n\n` +
    `📊 Jami: ${total}\n` +
    `👑 Adminlar: ${admins}\n` +
    `📱 Telegram: ${tgUsers}`,
    { parse_mode: 'Markdown' }
  );
});

// /broadcast command
bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply('❌ Bu buyruq faqat adminlar uchun');
  ctx.session = ctx.session || {};
  ctx.session.awaitingBroadcast = true;
  await ctx.reply('📢 Xabar yozing (barcha telegram foydalanuvchilarga yuboriladi):');
});

// /cancel
bot.command('cancel', async (ctx) => {
  if (ctx.session) ctx.session.awaitingBroadcast = false;
  await ctx.reply('❌ Bekor qilindi', userKeyboard);
});

// ─── Matn xabarlar ────────────────────────────────────────────────────────────
bot.on('text', async (ctx) => {
  // Broadcast kutilmoqda
  if (ctx.session?.awaitingBroadcast && isAdmin(ctx.from.id)) {
    ctx.session.awaitingBroadcast = false;
    const text = ctx.message.text;
    const users = await User.find({ telegramId: { $ne: null } });

    const sending = await ctx.reply('⏳ Xabar yuborilmoqda...');
    const result = await broadcastToAll(`📢 Xabar:\n\n${text}`, users.map((u) => u.telegramId));

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      sending.message_id,
      null,
      `✅ ${result.sent} ta foydalanuvchiga xabar yuborildi${result.failed ? ` (${result.failed} ta xato)` : ''}`
    );
    return;
  }

  // Noma'lum buyruq
  await ctx.reply('❓ Noma\'lum buyruq. /help yozing yoki tugmalardan foydalaning.');
});

// ─── Bot'ni ishga tushirish ───────────────────────────────────────────────────
const startBot = async () => {
  try {
    const me = await bot.telegram.getMe();
    console.log(`✅ Bot: @${me.username}`);

    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
      const webhookUrl = `${process.env.WEBHOOK_URL}/bot${process.env.BOT_TOKEN}`;
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`✅ Webhook: ${webhookUrl}`);
    } else {
      await bot.telegram.deleteWebhook();
      bot.launch({ dropPendingUpdates: true });
      console.log('✅ Bot polling rejimida ishlamoqda');

      process.once('SIGINT', () => bot.stop('SIGINT'));
      process.once('SIGTERM', () => bot.stop('SIGTERM'));
    }
  } catch (err) {
    console.error('❌ Bot xatosi:', err.message);
  }
};

module.exports = { bot, startBot, notifyAdmin, sendMessage, broadcastToAll };

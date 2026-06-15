const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [usersCount, productsCount, ordersCount, revenueResult, recentOrders, ordersByStatus] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.find()
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(5),
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

    res.json({
      stats: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        revenue: revenueResult[0]?.total || 0,
      },
      recentOrders,
      ordersByStatus,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ users, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Noto\'g\'ri rol' });
    }
    // O'zini admin'dan foydalanuvchiga o'zgartira olmasin
    if (req.params.id === req.user._id.toString() && role === 'user') {
      return res.status(400).json({ message: 'O\'zingizni admin huquqidan mahrum qila olmaysiz' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { status } : {};
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Noto\'g\'ri status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      'user',
      'name email telegramId'
    );
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });

    // Foydalanuvchiga Telegram xabari
    if (order.user?.telegramId) {
      try {
        const { sendMessage } = require('../bot');
        const statusLabels = {
          confirmed: '✅ Tasdiqlandi',
          shipped: '🚚 Yo\'lda',
          delivered: '📬 Yetkazildi',
          cancelled: '❌ Bekor qilindi',
        };
        if (statusLabels[status]) {
          await sendMessage(
            order.user.telegramId,
            `📦 Buyurtmangiz holati yangilandi!\n\n${statusLabels[status]}\n💰 Summa: ${order.totalAmount.toLocaleString()} so'm`
          );
        }
      } catch (_) {}
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// POST /api/admin/broadcast
exports.broadcastMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Xabar matni kiritilmadi' });

    const users = await User.find({ telegramId: { $ne: null } });
    const { broadcastToAll } = require('../bot');
    const result = await broadcastToAll(
      `📢 Yangilik:\n\n${message}`,
      users.map((u) => u.telegramId)
    );

    res.json({
      message: `${result.sent} ta foydalanuvchiga xabar yuborildi`,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

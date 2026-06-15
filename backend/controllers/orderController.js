const Order = require('../models/Order');
const Product = require('../models/Product');

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Buyurtma bo\'sh bo\'lmasin' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Mahsulot topilmadi: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} omborda yetarli emas (mavjud: ${product.stock})`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;

      // Omborni kamaytirish
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {},
      notes: notes || '',
    });

    // Admin ga Telegram xabari
    try {
      const { notifyAdmin } = require('../bot');
      await notifyAdmin(
        `🛒 Yangi buyurtma!\n\n` +
        `👤 Foydalanuvchi: ${req.user.name}\n` +
        `📦 Mahsulotlar: ${orderItems.map((i) => `${i.name} x${i.quantity}`).join(', ')}\n` +
        `💰 Jami: ${totalAmount.toLocaleString()} so'm\n` +
        `📅 ${new Date().toLocaleString('uz-UZ')}`
      );
    } catch (_) {}

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/orders  — foydalanuvchi o'z buyurtmalari
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Buyurtma topilmadi' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Barcha maydonlarni to\'ldiring' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Bu email bilan foydalanuvchi mavjud' });
    }

    const user = await User.create({ name, email, password });

    // Admin ga Telegram xabari
    try {
      const { notifyAdmin } = require('../bot');
      await notifyAdmin(
        `🆕 Yangi ro'yxatdan o'tish!\n\n👤 Ism: ${name}\n📧 Email: ${email}\n📅 ${new Date().toLocaleString('uz-UZ')}`
      );
    } catch (_) {}

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va parol kiriting' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki parol noto\'g\'ri' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Hisobingiz bloklangan' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    telegramId: req.user.telegramId,
    telegramUsername: req.user.telegramUsername,
    createdAt: req.user.createdAt,
  });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Parol kamida 6 ta belgi bo\'lsin' });
      }
      user.password = password;
    }

    await user.save();

    res.json({
      message: 'Profil muvaffaqiyatli yangilandi',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

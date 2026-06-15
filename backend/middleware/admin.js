module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bu amalni bajarish uchun admin huquqi kerak' });
  }
  next();
};

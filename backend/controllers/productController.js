const Product = require('../models/Product');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

// POST /api/products  [admin]
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Xato', error: err.message });
  }
};

// PUT /api/products/:id  [admin]
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Xato', error: err.message });
  }
};

// DELETE /api/products/:id  [admin] — soft delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });
    res.json({ message: 'Mahsulot o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi', error: err.message });
  }
};

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mahsulot nomi majburiy'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Tavsif majburiy'],
    },
    price: {
      type: Number,
      required: [true, 'Narx majburiy'],
      min: [0, 'Narx manfiy bo\'lmasin'],
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Rasm+yo\'q',
    },
    category: {
      type: String,
      required: [true, 'Kategoriya majburiy'],
      enum: ['Elektronika', 'Kiyim', 'Oziq-ovqat', 'Uy-ro\'zg\'or', 'Sport', 'Boshqa'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Ombor manfiy bo\'lmasin'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Qidiruv uchun indeks
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

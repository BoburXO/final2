const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ism majburiy'],
      trim: true,
      maxlength: [50, 'Ism 50 ta belgidan oshmasin'],
    },
    email: {
      type: String,
      required: [true, 'Email majburiy'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Parol majburiy'],
      minlength: [6, 'Parol kamida 6 ta belgi'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    telegramId: {
      type: Number,
      default: null,
    },
    telegramUsername: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Parolni saqlashdan oldin xashlash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Parolni tekshirish
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON ga o'girishda parolni olib tashlash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ordersAPI } from '../api';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&q=60';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ address: '', city: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const total = getTotalPrice();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleOrder = async () => {
    if (!user) {
      toast.error('Buyurtma berish uchun kiring!');
      navigate('/login');
      return;
    }
    if (!address.address || !address.city || !address.phone) {
      toast.error('Yetkazib berish ma\'lumotlarini to\'ldiring');
      return;
    }
    setLoading(true);
    try {
      await ordersAPI.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: address,
        notes,
      });
      clearCart();
      toast.success('🎉 Buyurtma muvaffaqiyatli berildi!', { duration: 4000 });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-5" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Savat bo'sh</h2>
        <p className="text-gray-400 mb-8">Do'konimizdan mahsulot tanlang</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
          Xarid qilish <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🛒 Savat <span className="text-gray-400 text-xl font-normal">({itemCount} ta)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Items ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex items-center gap-4">
              <img
                src={item.image || PLACEHOLDER}
                alt={item.name}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                <p className="text-green-500 font-bold">{item.price.toLocaleString()} so'm</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right w-24 flex-shrink-0">
                <p className="font-bold text-gray-800">
                  {(item.price * item.quantity).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">so'm</p>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="text-gray-300 hover:text-red-500 transition p-1"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => { clearCart(); toast.success('Savat tozalandi'); }}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            Savatni tozalash
          </button>
        </div>

        {/* ─── Order summary ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Shipping */}
          <div className="card p-5">
            <h2 className="font-bold text-lg mb-4">📍 Yetkazib berish</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Manzil *</label>
                <input
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  placeholder="Ko'cha, uy raqami"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Shahar *</label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Toshkent"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telefon *</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+998 90 000 00 00"
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Izoh (ixtiyoriy)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qo'shimcha ma'lumot..."
                  rows={2}
                  className="input text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="card p-5">
            <h2 className="font-bold text-lg mb-4">💰 Hisob-kitob</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-500">
                <span>Mahsulotlar ({itemCount} ta)</span>
                <span>{total.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Yetkazish</span>
                <span className="text-green-600 font-medium">Bepul</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Jami</span>
                <span className="text-green-500">{total.toLocaleString()} so'm</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Buyurtma berilmoqda...
                </span>
              ) : '✅ Buyurtma berish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

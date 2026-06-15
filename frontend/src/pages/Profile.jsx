import { useEffect, useState } from 'react';
import { User, Package, Settings, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { ordersAPI } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS = {
  pending:   { label: 'Kutilmoqda', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Tasdiqlandi', cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: "Yo'lda", cls: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Yetkazildi', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Bekor', cls: 'bg-red-100 text-red-700' },
};

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState('orders');
  const [form, setForm] = useState({ name: user?.name || '', password: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const data = { name: form.name };
    if (form.password) data.password = form.password;
    const result = await updateProfile(data);
    setSavingProfile(false);
    if (result.success) {
      toast.success('Profil saqlandi! ✅');
      setForm((f) => ({ ...f, password: '' }));
    } else {
      toast.error(result.error || 'Xato');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header card */}
      <div className="bg-gradient-to-r from-green-600 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {user?.role === 'admin' ? '👑' : '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-green-200 text-sm">{user?.email}</p>
            <span className="inline-block mt-1 bg-white/20 px-3 py-0.5 rounded-full text-xs">
              {user?.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
            </span>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-green-200 text-xs">Buyurtma</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'orders', icon: Package, label: 'Buyurtmalarim' },
          { id: 'settings', icon: Settings, label: 'Sozlamalar' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-medium text-sm transition ${
              tab === id ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {tab === 'orders' && (
        <div>
          {loadingOrders ? (
            <div className="py-20"><LoadingSpinner /></div>
          ) : orders.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Hali buyurtma yo'q</p>
              <p className="text-gray-400 text-sm mt-1">Do'konimizdan xarid qiling</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="card p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS[order.status]?.cls}`}>
                      {STATUS[order.status]?.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>
                          {item.name}{' '}
                          <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                        <span>{(item.price * item.quantity).toLocaleString()} so'm</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-gray-600">Jami</span>
                    <span className="text-green-500">{order.totalAmount.toLocaleString()} so'm</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-5">Profil sozlamalari</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">Email o'zgartirilmaydi</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yangi parol <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Yangi parol kiriting (min. 6 ta belgi)"
                minLength={6}
                className="input"
              />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary px-8 py-2">
              {savingProfile ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

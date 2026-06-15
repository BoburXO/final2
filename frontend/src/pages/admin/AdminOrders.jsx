import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS = {
  pending:   { label: 'Kutilmoqda', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Tasdiqlandi', cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: "Yo'lda",      cls: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Yetkazildi',  cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Bekor',       cls: 'bg-red-100 text-red-700' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = (status = '') => {
    setLoading(true);
    adminAPI.getAllOrders({ status: status || undefined, limit: 50 })
      .then((res) => { setOrders(res.data.orders); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const changeFilter = (s) => { setFilter(s); load(s); };

  const changeStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success('Status yangilandi ✅');
    } catch {
      toast.error('Xato yuz berdi');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛒 Buyurtmalar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} ta buyurtma</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => changeFilter(e.target.value)}
            className="input text-sm w-auto"
          >
            <option value="">Barchasi</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS[s].label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">Buyurtma topilmadi</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{order.user?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{order.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-500 text-lg">{order.totalAmount?.toLocaleString()} so'm</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-1 mb-3">
                {order.items?.map((item, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                    {item.name} ×{item.quantity}
                  </span>
                ))}
              </div>

              {/* Shipping */}
              {order.shippingAddress?.address && (
                <p className="text-xs text-gray-400 mb-3">
                  📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                  {order.shippingAddress.phone && ` · 📞 ${order.shippingAddress.phone}`}
                </p>
              )}

              {/* Status row */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS[order.status]?.cls}`}>
                  {STATUS[order.status]?.label}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-gray-400">Status:</span>
                  <select
                    value={order.status}
                    onChange={(e) => changeStatus(order._id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

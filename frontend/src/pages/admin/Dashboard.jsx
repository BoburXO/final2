import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS = {
  pending:   { label: 'Kutilmoqda', cls: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Tasdiqlandi', cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: "Yo'lda", cls: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Yetkazildi', cls: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Bekor', cls: 'bg-red-100 text-red-700' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;
  if (!data) return null;

  const { stats, recentOrders } = data;

  const cards = [
    { label: 'Foydalanuvchilar', value: stats.users, icon: Users,         color: 'blue',   link: '/admin/users' },
    { label: 'Mahsulotlar',      value: stats.products, icon: Package,     color: 'green',  link: '/admin/products' },
    { label: 'Buyurtmalar',      value: stats.orders, icon: ShoppingCart,  color: 'purple', link: '/admin/orders' },
    { label: 'Daromad',          value: `${(stats.revenue || 0).toLocaleString()} so'm`, icon: TrendingUp, color: 'orange' },
  ];

  const colorMap = {
    blue:   'bg-blue-100 text-blue-600',
    green:  'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-500 mt-1">Umumiy ko'rsatkichlar</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, link }) => (
          <div key={label} className="card p-5 hover:shadow-md transition">
            <div className={`${colorMap[color]} w-11 h-11 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            {link && (
              <Link to={link} className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                Ko'rish <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div className="card overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-gray-100">
          <h2 className="font-bold text-gray-800">So'nggi buyurtmalar</h2>
          <Link to="/admin/orders" className="text-indigo-600 text-sm hover:underline flex items-center gap-1">
            Barchasi <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50">
                <th className="px-5 py-3 font-medium">Foydalanuvchi</th>
                <th className="px-5 py-3 font-medium">Summa</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Sana</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Buyurtma yo'q</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{order.user?.name || 'N/A'}</p>
                    <p className="text-gray-400 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold text-indigo-600">
                    {order.totalAmount?.toLocaleString()} so'm
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS[order.status]?.cls}`}>
                      {STATUS[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

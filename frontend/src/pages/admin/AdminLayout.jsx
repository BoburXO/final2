import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',         exact: true },
  { to: '/admin/products', icon: Package,          label: 'Mahsulotlar' },
  { to: '/admin/orders',   icon: ShoppingCart,     label: 'Buyurtmalar' },
  { to: '/admin/users',    icon: Users,            label: 'Foydalanuvchilar' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="font-bold text-lg text-indigo-600">🔧 Admin Panel</span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-indigo-50 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-indigo-500">👑 Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                isActive(to, exact)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Saytga qaytish
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

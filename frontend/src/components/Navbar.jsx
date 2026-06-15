import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = getTotalItems();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Asosiy sahifa' },
    { to: '/products', label: 'Mahsulotlar katalogi' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
         <span className='flex items-center gap-10'>
           <Link to="/" className="flex items-center gap-2 text-green-500 font-bold text-xl">
            <ShoppingBag className="h-7 w-7" />
            <span>BoburShopBot</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  isActive(to) ? 'text-green-500' : 'text-gray-600 hover:text-green-500'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

         </span>
          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-500 transition">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                    title="Admin panel"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Chiqish"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-green-500 transition px-2">
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-green-500 transition"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive(to) ? 'bg-green-50 text-green-500' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-green-500">
                    🔧 Admin Dashboard
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-600">
                  👤 {user.name}
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-500">
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-gray-600">Kirish</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-sm text-green-500 font-medium">Ro'yxatdan o'tish</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

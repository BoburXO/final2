import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ShoppingBag, Shield, Truck, MessageCircle, ArrowRight, Star } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const features = [
  { icon: ShoppingBag, title: 'Keng assortiment', desc: 'Yuzlab mahsulot toifalaridan tanlang', color: 'bg-blue-100 text-blue-600' },
  { icon: Shield, title: 'Xavfsiz xarid', desc: 'Ma\'lumotlaringiz to\'liq himoyalangan', color: 'bg-green-100 text-green-600' },
  { icon: Truck, title: 'Tez yetkazish', desc: '1-3 ish kuni ichida eshigingizga', color: 'bg-orange-100 text-orange-600' },
  { icon: MessageCircle, title: 'Telegram Bot', desc: 'Bot orqali ham qulay xarid qiling', color: 'bg-purple-100 text-purple-600' },
];

export default function Home() {
  const { products, loading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts({ limit: 6 });
  }, []);

  const botUsername = import.meta.env.VITE_BOT_USERNAME || 'ShopBot_uz';

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
            <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            <span>O'zbekistonning #1 online do'koni</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            🛍️ ShopBot<br />
            <span className="text-indigo-200">Online Do'kon</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Qulay narxlarda sifatli mahsulotlar. Web sayt yoki Telegram bot orqali buyurtma bering!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg"
            >
              Xarid qilish <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white/70 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition"
            >
              📱 Telegram Bot
            </a>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition">
                <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured products ─────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🔥 Mashhur mahsulotlar</h2>
              <p className="text-gray-500 mt-1 text-sm">Eng ko'p sotib olinayotganlar</p>
            </div>
            <Link to="/products" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
              Barchasi <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-20"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Telegram CTA ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-3xl font-bold mb-3">Telegram Botimiz</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Mahsulotlarni ko'rish, buyurtma berish va buyurtmalaringizni kuzatish — hammasi Telegram orqali!
          </p>
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition shadow-lg text-lg"
          >
            @{botUsername}
          </a>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            🛍️ ShopBot
          </div>
          <p className="text-sm">© {new Date().getFullYear()} ShopBot. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/products" className="hover:text-white transition">Mahsulotlar</Link>
            <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

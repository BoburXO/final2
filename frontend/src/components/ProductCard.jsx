import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`"${product.name}" savatga qo'shildi! 🛒`);
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 h-48">
          <img
            src={product.image || PLACEHOLDER}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = PLACEHOLDER; }}
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/40 px-3 py-1 rounded-full">
                Tugagan
              </span>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-green-500 text-xs font-medium px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 flex-1">{product.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-500">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 ml-1">so'm</span>
            </div>

            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-500 active:bg-green-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Savatga qo'shish"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

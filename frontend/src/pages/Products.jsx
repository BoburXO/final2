import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useProductStore } from '../store/productStore';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Elektronika', 'Kiyim', 'Oziq-ovqat', "Uy-ro'zg'or", 'Sport', 'Boshqa'];
const LIMIT = 12;

export default function Products() {
  const { products, total, totalPages, loading, fetchProducts } = useProductStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const load = (p = 1, cat = category, q = search) => {
    const params = { page: p, limit: LIMIT };
    if (cat) params.category = cat;
    if (q.trim()) params.search = q.trim();
    fetchProducts(params);
  };

  useEffect(() => {
    load(page);
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, category, search);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📦 Mahsulotlar</h1>
        <p className="text-gray-500 mt-1">
          {total > 0 ? `${total} ta mahsulot topildi` : 'Hech narsa topilmadi'}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary px-6">
          Qidirish
        </button>
      </form>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategory('')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            !category ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'
          }`}
        >
          Barchasi
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              category === cat
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-green-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">Mahsulot topilmadi</p>
          <button
            onClick={() => { setSearch(''); setCategory(''); setPage(1); load(1, '', ''); }}
            className="mt-3 text-green-500 hover:underline text-sm"
          >
            Filtrlarni tozalash
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm"
          >
            ← Oldingi
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                page === i + 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-sm"
          >
            Keyingi →
          </button>
        </div>
      )}
    </div>
  );
}

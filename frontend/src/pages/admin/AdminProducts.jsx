import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATS = ['Elektronika', 'Kiyim', 'Oziq-ovqat', "Uy-ro'zg'or", 'Sport', 'Boshqa'];
const EMPTY = { name: '', description: '', price: '', category: CATS[0], stock: '', image: '' };
const PLACEHOLDER = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=60&q=60';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    productsAPI.getAll({ limit: 100 })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, stock: String(p.stock), image: p.image || '' });
    setEditId(p._id);
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editId) await productsAPI.update(editId, body);
      else await productsAPI.create(body);
      toast.success(editId ? 'Mahsulot yangilandi ✅' : "Mahsulot qo'shildi ✅");
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await productsAPI.delete(id);
      toast.success("Mahsulot o'chirildi");
      load();
    } catch {
      toast.error('Xato yuz berdi');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Mahsulotlar</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Yangi mahsulot
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Mahsulot</th>
                <th className="px-5 py-3 font-medium">Narx</th>
                <th className="px-5 py-3 font-medium">Kategoriya</th>
                <th className="px-5 py-3 font-medium">Ombor</th>
                <th className="px-5 py-3 font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <Package className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  Mahsulot yo'q
                </td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || PLACEHOLDER}
                        alt={p.name}
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-gray-400 text-xs line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-green-500">
                    {p.price.toLocaleString()} so'm
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{p.category}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={p.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500'}>
                      {p.stock > 0 ? `${p.stock} ta` : 'Tugagan'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-lg">{editId ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nomi *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Mahsulot nomi" required className="input text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tavsif *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mahsulot haqida..." required rows={3} className="input text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Narx (so'm) *</label>
                  <input type="number" min="0" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0" required className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ombor (ta) *</label>
                  <input type="number" min="0" value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="0" required className="input text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Kategoriya *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input text-sm">
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rasm URL</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..." className="input text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1 py-2">Bekor</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2">
                  {saving ? 'Saqlanmoqda...' : editId ? 'Yangilash' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Crown, User, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    adminAPI.getUsers({ limit: 50 })
      .then((res) => { setUsers(res.data.users); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Foydalanuvchini "${newRole}" roliga o'tkazasizmi?`)) return;
    try {
      const res = await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? res.data : u));
      toast.success('Rol yangilandi ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xato');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setSending(true);
    try {
      const res = await adminAPI.broadcastMessage(broadcastMsg);
      toast.success(res.data.message);
      setBroadcastMsg('');
      setBroadcastModal(false);
    } catch {
      toast.error('Xabar yuborishda xato');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  const telegramCount = users.filter((u) => u.telegramId).length;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Foydalanuvchilar</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} ta jami · {telegramCount} ta Telegram bog'langan
          </p>
        </div>
        <button
          onClick={() => setBroadcastModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Send className="h-4 w-4" /> Xabar yuborish
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-5 py-3 font-medium">Foydalanuvchi</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Telegram</th>
                <th className="px-5 py-3 font-medium">Sana</th>
                <th className="px-5 py-3 font-medium">Amal</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        u.role === 'admin' ? 'bg-yellow-100' : 'bg-indigo-100'
                      }`}>
                        {u.role === 'admin'
                          ? <Crown className="h-4 w-4 text-yellow-600" />
                          : <User className="h-4 w-4 text-indigo-600" />}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {u.telegramId
                      ? <span className="text-blue-500">@{u.telegramUsername || u.telegramId}</span>
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleRole(u._id, u.role)}
                      className="text-xs border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      {u.role === 'admin' ? 'User qilish' : 'Admin qilish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {broadcastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg mb-1">📢 Telegram xabar yuborish</h2>
            <p className="text-sm text-gray-500 mb-4">
              {telegramCount} ta foydalanuvchiga Telegram orqali xabar yuboriladi
            </p>
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Xabar matnini kiriting..."
              rows={5}
              className="input text-sm resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setBroadcastModal(false)} className="btn-outline flex-1 py-2">Bekor</button>
              <button onClick={handleBroadcast} disabled={sending || !broadcastMsg.trim()} className="btn-primary flex-1 py-2">
                {sending ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

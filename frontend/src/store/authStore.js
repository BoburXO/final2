import { create } from 'zustand';
import { authAPI } from '../api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.register(data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Xato yuz berdi';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authAPI.login(data);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.message || 'Email yoki parol noto\'g\'ri';
      set({ loading: false, error });
      return { success: false, error };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  getMe: async () => {
    if (!get().token) return;
    try {
      const res = await authAPI.getMe();
      set({ user: res.data });
    } catch {
      get().logout();
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      set({ user: res.data.user });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Xato' };
    }
  },

  clearError: () => set({ error: null }),
}));

import { create } from 'zustand';
import { productsAPI } from '../api';

export const useProductStore = create((set) => ({
  products: [],
  total: 0,
  totalPages: 1,
  loading: false,
  error: null,

  fetchProducts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await productsAPI.getAll(params);
      set({
        products: res.data.products,
        total: res.data.total,
        totalPages: res.data.totalPages,
        loading: false,
      });
    } catch {
      set({ error: 'Mahsulotlarni yuklashda xato', loading: false });
    }
  },
}));

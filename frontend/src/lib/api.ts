import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  created_at: string;
  average_rating: number;
  review_count: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  user_id: number;
  product: Product;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  phone: string;
  items: OrderItem[];
  created_at: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const authAPI = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    const response = await api.post<User>('/api/auth/register', { ...data, role: 'user' });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post<{ access_token: string; token_type: string }>('/api/auth/login', formData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
  updateProfile: async (data: { full_name?: string; email?: string }) => {
    const response = await api.put<User>('/api/auth/me', data);
    return response.data;
  },
};

export const productsAPI = {
  getProducts: async (params?: { page?: number; page_size?: number; category?: string; search?: string }) => {
    const response = await api.get<PaginatedProducts>('/api/products', { params });
    return response.data;
  },
  getProduct: async (id: number) => {
    const response = await api.get<Product>(`/api/products/${id}`);
    return response.data;
  },
  createProduct: async (data: Omit<Product, 'id' | 'created_at' | 'average_rating' | 'review_count'>) => {
    const response = await api.post<Product>('/api/products', data);
    return response.data;
  },
  updateProduct: async (id: number, data: Partial<Omit<Product, 'id' | 'created_at' | 'average_rating' | 'review_count'>>) => {
    const response = await api.put<Product>(`/api/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: number) => {
    await api.delete(`/api/products/${id}`);
  },
  getCategories: async () => {
    const response = await api.get<string[]>('/api/categories');
    return response.data;
  },
};

export const reviewsAPI = {
  getProductReviews: async (productId: number) => {
    const response = await api.get<Review[]>(`/api/products/${productId}/reviews`);
    return response.data;
  },
  createReview: async (data: { product_id: number; rating: number; comment: string }) => {
    const response = await api.post<Review>('/api/reviews', data);
    return response.data;
  },
};

export const cartAPI = {
  getCart: async () => {
    const response = await api.get<CartItem[]>('/api/cart');
    return response.data;
  },
  addToCart: async (data: { product_id: number; quantity: number }) => {
    const response = await api.post<CartItem>('/api/cart', data);
    return response.data;
  },
  updateCartItem: async (id: number, data: { quantity: number }) => {
    const response = await api.put<CartItem>(`/api/cart/${id}`, data);
    return response.data;
  },
  removeFromCart: async (id: number) => {
    await api.delete(`/api/cart/${id}`);
  },
};

export const ordersAPI = {
  createOrder: async (data: { shipping_address: string; phone: string; payment_method_id: string }) => {
    const response = await api.post<Order>('/api/orders', data);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get<Order[]>('/api/orders');
    return response.data;
  },
  getOrder: async (id: number) => {
    const response = await api.get<Order>(`/api/orders/${id}`);
    return response.data;
  },
};

export const adminAPI = {
  getAllOrders: async () => {
    const response = await api.get<Order[]>('/api/admin/orders');
    return response.data;
  },
  updateOrderStatus: async (id: number, status: Order['status']) => {
    const response = await api.put<Order>(`/api/admin/orders/${id}/status`, null, { params: { status } });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get<User[]>('/api/admin/users');
    return response.data;
  },
};

export default api;

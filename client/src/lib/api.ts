import { Material, Supplier, Order, Cart, Location } from '../types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

interface ApiParams {
  [key: string]: string | undefined;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  businessName?: string;
  location: Location;
}

interface MaterialData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  minOrderQuantity?: number;
  bulkDiscount?: number;
  imageUrl?: string;
}

interface OrderData {
  materials: Array<{
    materialId: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  notes?: string;
  paymentMethod?: 'cash' | 'online';
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  token?: string;
  user?: Record<string, unknown>; // More specific than any
  materials?: Material[];
  suppliers?: Supplier[];
  orders?: Order[];
  cart?: Cart;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('bazaar_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(userData: Partial<RegisterData>) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Materials endpoints
  async getMaterials(params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/materials${queryString ? `?${queryString}` : ''}`);
  }

  async getMaterialById(id: string) {
    return this.request(`/materials/${id}`);
  }

  async createMaterial(materialData: MaterialData) {
    return this.request('/materials', {
      method: 'POST',
      body: JSON.stringify(materialData),
    });
  }

  async updateMaterial(id: string, materialData: Partial<MaterialData>) {
    return this.request(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(materialData),
    });
  }

  async deleteMaterial(id: string) {
    return this.request(`/materials/${id}`, {
      method: 'DELETE',
    });
  }

  async searchMaterials(query: string, params: ApiParams = {}) {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/materials/search?${queryString}`);
  }

  // Suppliers endpoints
  async getSuppliers(params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/suppliers${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplierById(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async getSupplierMaterials(id: string, params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/suppliers/${id}/materials${queryString ? `?${queryString}` : ''}`);
  }

  async searchSuppliers(query: string, params: ApiParams = {}) {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/suppliers/search?${queryString}`);
  }

  async getNearbySuppliers(latitude: number, longitude: number, radius: number = 25) {
    const queryString = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    }).toString();
    return this.request(`/suppliers/nearby?${queryString}`);
  }

  // Cart endpoints
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(materialId: string, quantity: number, supplierId?: string) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ materialId, quantity, supplierId }),
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request('/cart', {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async createOrder(orderData: OrderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async cancelOrder(id: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async getVendorOrders(params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/vendor/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  async getSupplierOrders(params: ApiParams = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders/supplier/my-orders${queryString ? `?${queryString}` : ''}`);
  }

  // Location endpoints
  async getNearbySuppliersByLocation(latitude: number, longitude: number, radius: number = 25) {
    const queryString = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    }).toString();
    return this.request(`/location/nearby-suppliers?${queryString}`);
  }

  async calculateDistance(from: Location, to: Location) {
    return this.request('/location/calculate-distance', {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    });
  }

  async searchLocations(query: string) {
    const queryString = new URLSearchParams({ q: query }).toString();
    return this.request(`/location/search?${queryString}`);
  }

  async validatePincode(pincode: string) {
    return this.request(`/location/validate-pincode/${pincode}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

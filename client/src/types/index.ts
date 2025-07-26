export interface Material {
  _id?: string; // MongoDB ID
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  supplierId: string;
  supplierName?: string;
  rating?: number;
  imageUrl?: string;
  category: string;
  description?: string;
  location?: Location;
  distance?: number; // Distance from vendor in km
  deliveryTime?: string; // Estimated delivery time
  minOrderQuantity?: number;
  bulkDiscount?: number; // Percentage discount for bulk orders
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  _id?: string;
  material?: Material; // Frontend convenience property
  materialId: string | Material; // Can be string ID or populated Material object
  quantity: number;
  supplierId: string;
  supplierName?: string;
  totalPrice: number;
  addedAt: Date;
  price: number;
}

export interface Cart {
  _id?: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  estimatedDelivery?: string;
  deliveryFee?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  distance?: number; // Distance from user location
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  location: Location;
  rating: number;
  totalOrders: number;
  deliveryRadius: number; // Delivery radius in km
  averageDeliveryTime: string;
  minimumOrderAmount: number;
  isVerified: boolean;
  specialties: string[]; // Categories they specialize in
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
}

export interface PriceComparison {
  materialId: string;
  materialName: string;
  suppliers: {
    supplierId: string;
    supplierName: string;
    price: number;
    quantity: number;
    unit: string;
    distance: number;
    deliveryTime: string;
    rating: number;
    isAvailable: boolean;
  }[];
}

export interface Order {
  _id?: string;
  id: string;
  vendorId: string;
  vendorName?: string;
  materials: {
    materialId: string;
    materialName?: string;
    name?: string;
    quantity: number;
    price: number;
    unit?: string;
    supplierId: string;
    supplierName?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  estimatedDelivery?: Date;
  deliveryAddress: string | object;
  notes?: string;
  paymentMethod?: 'cash' | 'online';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WishlistItem {
  materialId: string;
  materialName: string;
  category: string;
  addedAt: Date;
  priceRange: {
    min: number;
    max: number;
  };
  suppliers: string[]; // Supplier IDs
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order_update' | 'price_alert' | 'stock_alert' | 'delivery_update' | 'new_supplier';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedId?: string; // Order ID, Material ID, etc.
  actionUrl?: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  location: Location;
  preferences: {
    preferredCategories: string[];
    maxDeliveryDistance: number;
    budgetRange: {
      min: number;
      max: number;
    };
    preferredSuppliers: string[];
    notifications: {
      priceAlerts: boolean;
      stockAlerts: boolean;
      orderUpdates: boolean;
      newSuppliers: boolean;
    };
  };
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteSuppliers: string[];
    mostOrderedCategories: string[];
  };
}
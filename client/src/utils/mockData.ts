import { Material, Order, Supplier, Location } from '../types';

// Mock location data for major Indian cities
const mockLocations: Location[] = [
  {
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Mumbai Central',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400008',
  },
  {
    latitude: 28.7041,
    longitude: 77.1025,
    address: 'Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
  },
  {
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
  },
  {
    latitude: 22.5726,
    longitude: 88.3639,
    address: 'Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
  },
  {
    latitude: 17.3850,
    longitude: 78.4867,
    address: 'Banjara Hills',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
  },
  {
    latitude: 13.0827,
    longitude: 80.2707,
    address: 'Marina Beach',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
  },
];

// Mock suppliers data
export const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Fresh Spice Traders',
    email: 'contact@freshspice.com',
    phone: '+91-98765-43210',
    address: 'Spice Market, Crawford Market, Mumbai',
    location: mockLocations[0],
    rating: 4.5,
    totalOrders: 1250,
    deliveryRadius: 25,
    averageDeliveryTime: 'Same day',
    minimumOrderAmount: 500,
    isVerified: true,
    specialties: ['Spices', 'Herbs', 'Dry Fruits'],
    operatingHours: {
      open: '06:00',
      close: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'supplier-2',
    name: 'Premium Rice Suppliers',
    email: 'info@premiumrice.com',
    phone: '+91-98765-43211',
    address: 'Grain Market, Dadar, Mumbai',
    location: mockLocations[0],
    rating: 4.2,
    totalOrders: 890,
    deliveryRadius: 30,
    averageDeliveryTime: 'Next day',
    minimumOrderAmount: 1000,
    isVerified: true,
    specialties: ['Rice', 'Grains', 'Pulses'],
    operatingHours: {
      open: '07:00',
      close: '19:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'supplier-3',
    name: 'Organic Vegetable Hub',
    email: 'hello@organicveg.com',
    phone: '+91-98765-43212',
    address: 'Organic Market, Bandra West, Mumbai',
    location: mockLocations[0],
    rating: 4.8,
    totalOrders: 2100,
    deliveryRadius: 20,
    averageDeliveryTime: 'Same day',
    minimumOrderAmount: 300,
    isVerified: true,
    specialties: ['Vegetables', 'Fruits', 'Organic Products'],
    operatingHours: {
      open: '05:00',
      close: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  },
  {
    id: 'supplier-4',
    name: 'Delhi Spice Empire',
    email: 'sales@delhispice.com',
    phone: '+91-98765-43213',
    address: 'Khari Baoli, Old Delhi',
    location: mockLocations[1],
    rating: 4.6,
    totalOrders: 1800,
    deliveryRadius: 35,
    averageDeliveryTime: '1-2 days',
    minimumOrderAmount: 800,
    isVerified: true,
    specialties: ['Spices', 'Dry Fruits', 'Nuts'],
    operatingHours: {
      open: '06:00',
      close: '21:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    id: 'supplier-5',
    name: 'Bangalore Fresh Foods',
    email: 'contact@bangalorefresh.com',
    phone: '+91-98765-43214',
    address: 'KR Market, Bangalore',
    location: mockLocations[2],
    rating: 4.3,
    totalOrders: 950,
    deliveryRadius: 25,
    averageDeliveryTime: 'Same day',
    minimumOrderAmount: 400,
    isVerified: true,
    specialties: ['Vegetables', 'Fruits', 'Herbs'],
    operatingHours: {
      open: '05:00',
      close: '19:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
];

// Mock materials data with location information
export const mockMaterials: Material[] = [
  {
    id: 'material-1',
    name: 'Basmati Rice',
    price: 120,
    quantity: 500,
    unit: 'kg',
    supplierId: 'supplier-2',
    supplierName: 'Premium Rice Suppliers',
    rating: 4.2,
    category: 'Rice',
    description: 'Premium quality long grain basmati rice, perfect for biryanis and pulao',
    location: mockLocations[0],
    minOrderQuantity: 10,
    bulkDiscount: 5,
  },
  {
    id: 'material-2',
    name: 'Cardamom Green',
    price: 850,
    quantity: 100,
    unit: 'kg',
    supplierId: 'supplier-1',
    supplierName: 'Fresh Spice Traders',
    rating: 4.5,
    category: 'Spices',
    description: 'Fresh green cardamom pods, aromatic and flavorful',
    location: mockLocations[0],
    minOrderQuantity: 1,
    bulkDiscount: 10,
  },
  {
    id: 'material-3',
    name: 'Tomatoes',
    price: 40,
    quantity: 200,
    unit: 'kg',
    supplierId: 'supplier-3',
    supplierName: 'Organic Vegetable Hub',
    rating: 4.8,
    category: 'Vegetables',
    description: 'Fresh organic tomatoes, perfect for cooking and salads',
    location: mockLocations[0],
    minOrderQuantity: 5,
    bulkDiscount: 3,
  },
  {
    id: 'material-4',
    name: 'Onions',
    price: 25,
    quantity: 300,
    unit: 'kg',
    supplierId: 'supplier-3',
    supplierName: 'Organic Vegetable Hub',
    rating: 4.6,
    category: 'Vegetables',
    description: 'Fresh red onions, essential for Indian cooking',
    location: mockLocations[0],
    minOrderQuantity: 10,
    bulkDiscount: 5,
  },
  {
    id: 'material-5',
    name: 'Cumin Seeds',
    price: 180,
    quantity: 150,
    unit: 'kg',
    supplierId: 'supplier-1',
    supplierName: 'Fresh Spice Traders',
    rating: 4.4,
    category: 'Spices',
    description: 'Premium quality cumin seeds, essential for Indian cuisine',
    location: mockLocations[0],
    minOrderQuantity: 2,
    bulkDiscount: 8,
  },
  {
    id: 'material-6',
    name: 'Red Chilli Powder',
    price: 120,
    quantity: 80,
    unit: 'kg',
    supplierId: 'supplier-4',
    supplierName: 'Delhi Spice Empire',
    rating: 4.6,
    category: 'Spices',
    description: 'Hot and spicy red chilli powder, perfect for curries',
    location: mockLocations[1],
    minOrderQuantity: 1,
    bulkDiscount: 12,
  },
  {
    id: 'material-7',
    name: 'Potatoes',
    price: 30,
    quantity: 400,
    unit: 'kg',
    supplierId: 'supplier-5',
    supplierName: 'Bangalore Fresh Foods',
    rating: 4.3,
    category: 'Vegetables',
    description: 'Fresh potatoes, ideal for various dishes',
    location: mockLocations[2],
    minOrderQuantity: 15,
    bulkDiscount: 4,
  },
  {
    id: 'material-8',
    name: 'Coriander Powder',
    price: 140,
    quantity: 120,
    unit: 'kg',
    supplierId: 'supplier-1',
    supplierName: 'Fresh Spice Traders',
    rating: 4.5,
    category: 'Spices',
    description: 'Aromatic coriander powder, essential spice for Indian cooking',
    location: mockLocations[0],
    minOrderQuantity: 1,
    bulkDiscount: 7,
  },
];

// Mock orders data
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    vendorId: 'vendor-1',
    vendorName: 'Street Food Vendor 1',
    materials: [
      {
        materialId: 'material-1',
        materialName: 'Basmati Rice',
        quantity: 20,
        price: 120,
        supplierId: 'supplier-2',
        supplierName: 'Premium Rice Suppliers',
      },
      {
        materialId: 'material-2',
        materialName: 'Cardamom Green',
        quantity: 2,
        price: 850,
        supplierId: 'supplier-1',
        supplierName: 'Fresh Spice Traders',
      },
    ],
    totalAmount: 4100,
    status: 'delivered',
    orderDate: new Date('2024-01-15'),
    estimatedDelivery: new Date('2024-01-16'),
    deliveryAddress: mockLocations[0],
    paymentMethod: 'online',
    notes: 'Please deliver in the morning',
  },
  {
    id: 'order-2',
    vendorId: 'vendor-1',
    vendorName: 'Street Food Vendor 1',
    materials: [
      {
        materialId: 'material-3',
        materialName: 'Tomatoes',
        quantity: 10,
        price: 40,
        supplierId: 'supplier-3',
        supplierName: 'Organic Vegetable Hub',
      },
    ],
    totalAmount: 400,
    status: 'confirmed',
    orderDate: new Date('2024-01-20'),
    estimatedDelivery: new Date('2024-01-20'),
    deliveryAddress: mockLocations[0],
    paymentMethod: 'online',
  },
];

// Storage functions
export const getStoredMaterials = (): Material[] => {
  const stored = localStorage.getItem('bazaar_materials');
  return stored ? JSON.parse(stored) : mockMaterials;
};

export const storeMaterials = (materials: Material[]) => {
  localStorage.setItem('bazaar_materials', JSON.stringify(materials));
};

export const getStoredOrders = (): Order[] => {
  const stored = localStorage.getItem('bazaar_orders');
  return stored ? JSON.parse(stored) : mockOrders;
};

export const storeOrders = (orders: Order[]) => {
  localStorage.setItem('bazaar_orders', JSON.stringify(orders));
};

export const getStoredSuppliers = (): Supplier[] => {
  const stored = localStorage.getItem('bazaar_suppliers');
  return stored ? JSON.parse(stored) : mockSuppliers;
};

export const storeSuppliers = (suppliers: Supplier[]) => {
  localStorage.setItem('bazaar_suppliers', JSON.stringify(suppliers));
};
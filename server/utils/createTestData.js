import User from '../models/User.js';
import Material from '../models/Material.js';

export const createTestData = async () => {
  try {
    // Check if test data already exists
    const existingUser = await User.findOne({ email: 'vendor@test.com' });
    if (existingUser) {
      console.log('Test data already exists, skipping creation');
      return;
    }

    console.log('Creating test data...');

    // Create test vendor (password will be hashed by model middleware)
    const rawPassword = 'password123';
    
    const testVendor = await User.create({
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: rawPassword,
      role: 'vendor',
      phone: '+91-9876543210',
      businessName: 'Test Vendor Business',
      location: {
        address: '123 Test Street, Test City',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        latitude: 19.0760,
        longitude: 72.8777
      },
      preferences: {
        preferredCategories: ['vegetables', 'spices', 'dairy'],
        maxDeliveryDistance: 25,
        budgetRange: {
          min: 0,
          max: 10000
        },
        preferredSuppliers: [],
        notifications: {
          priceAlerts: true,
          stockAlerts: true,
          orderUpdates: true,
          newSuppliers: false
        }
      },
      statistics: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteSuppliers: [],
        mostOrderedCategories: []
      },
      isActive: true
    });

    // Create test supplier
    const testSupplier = await User.create({
      name: 'Test Supplier',
      email: 'supplier@test.com',
      password: rawPassword,
      role: 'supplier',
      phone: '+91-9876543211',
      businessName: 'Test Supplier Business',
      location: {
        address: '456 Supplier Lane, Test City',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        latitude: 19.0760,
        longitude: 72.8777
      },
      specialties: ['vegetables', 'spices', 'dairy'],
      operatingHours: {
        open: '08:00',
        close: '20:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      isActive: true,
      isVerified: true,
      rating: 4.5,
      totalOrders: 150
    });

    // Create test materials
    const testMaterials = [
      {
        name: 'Fresh Tomatoes',
        description: 'Fresh red tomatoes, perfect for curries and salads',
        price: 40,
        quantity: 100,
        unit: 'kg',
        category: 'Vegetables',
        supplierId: testSupplier._id,
        supplierName: testSupplier.name,
        location: testSupplier.location,
        minOrderQuantity: 1,
        isAvailable: true
      },
      {
        name: 'Basmati Rice',
        description: 'Premium quality basmati rice, aged for perfect aroma',
        price: 120,
        quantity: 50,
        unit: 'kg',
        category: 'Rice & Grains',
        supplierId: testSupplier._id,
        supplierName: testSupplier.name,
        location: testSupplier.location,
        minOrderQuantity: 5,
        bulkDiscount: 10,
        isAvailable: true
      },
      {
        name: 'Turmeric Powder',
        description: 'Pure turmeric powder, freshly ground',
        price: 200,
        quantity: 25,
        unit: 'kg',
        category: 'Spices',
        supplierId: testSupplier._id,
        supplierName: testSupplier.name,
        location: testSupplier.location,
        minOrderQuantity: 1,
        isAvailable: true
      },
      {
        name: 'Fresh Milk',
        description: 'Fresh cow milk, delivered daily',
        price: 60,
        quantity: 20,
        unit: 'l',
        category: 'Dairy Products',
        supplierId: testSupplier._id,
        supplierName: testSupplier.name,
        location: testSupplier.location,
        minOrderQuantity: 1,
        isAvailable: true
      },
      {
        name: 'Green Chilies',
        description: 'Fresh green chilies, medium spice level',
        price: 80,
        quantity: 15,
        unit: 'kg',
        category: 'Vegetables',
        supplierId: testSupplier._id,
        supplierName: testSupplier.name,
        location: testSupplier.location,
        minOrderQuantity: 1,
        isAvailable: true
      }
    ];

    await Material.insertMany(testMaterials);

    console.log('Test data created successfully!');
    console.log('Test Vendor: vendor@test.com / password123');
    console.log('Test Supplier: supplier@test.com / password123');

  } catch (error) {
    console.error('Error creating test data:', error);
  }
};

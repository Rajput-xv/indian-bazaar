import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: /^[1-9][0-9]{5}$/,
  },
});

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
    maxLength: [200, 'Material name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      'Spices',
      'Vegetables',
      'Rice & Grains',
      'Pulses & Lentils',
      'Oil & Ghee',
      'Dairy Products',
      'Dry Fruits',
      'Herbs',
      'Flours',
      'Seasonings',
      'Others'
    ],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    set: v => Math.round(v * 100) / 100, // Round to 2 decimal places
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'packet', 'bag', 'box', 'dozen'],
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1'],
  },
  bulkDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Bulk discount cannot be negative'],
    max: [50, 'Bulk discount cannot exceed 50%'],
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supplier ID is required'],
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Image URL must be a valid image URL',
    },
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      default: '',
    },
  }],
  deliveryTime: {
    type: String,
    default: 'Same day',
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > new Date();
      },
      message: 'Expiry date must be in the future',
    },
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  nutritionalInfo: {
    calories: {
      type: Number,
      min: 0,
    },
    protein: {
      type: Number,
      min: 0,
    },
    carbs: {
      type: Number,
      min: 0,
    },
    fat: {
      type: Number,
      min: 0,
    },
    fiber: {
      type: Number,
      min: 0,
    },
  },
  seasonality: [{
    type: String,
    enum: ['Spring', 'Summer', 'Monsoon', 'Autumn', 'Winter', 'Year-round'],
  }],
  stockAlert: {
    enabled: {
      type: Boolean,
      default: true,
    },
    threshold: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  orderCount: {
    type: Number,
    default: 0,
  },
  lastOrderDate: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for efficient querying
materialSchema.index({ supplierId: 1, isAvailable: 1 });
materialSchema.index({ category: 1, isAvailable: 1 });
materialSchema.index({ name: 'text', description: 'text', tags: 'text' });
materialSchema.index({ price: 1 });
materialSchema.index({ rating: -1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ location: '2dsphere' });
materialSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual for calculating discount price
materialSchema.virtual('discountPrice').get(function() {
  if (this.bulkDiscount > 0) {
    return Math.round((this.price * (1 - this.bulkDiscount / 100)) * 100) / 100;
  }
  return this.price;
});

// Virtual for checking low stock
materialSchema.virtual('isLowStock').get(function() {
  return this.stockAlert.enabled && this.quantity <= this.stockAlert.threshold;
});

// Virtual for total value in stock
materialSchema.virtual('stockValue').get(function() {
  return Math.round((this.price * this.quantity) * 100) / 100;
});

// Pre-save middleware to update supplier name
materialSchema.pre('save', async function(next) {
  if (this.isModified('supplierId')) {
    try {
      const User = mongoose.model('User');
      const supplier = await User.findById(this.supplierId).select('name');
      if (supplier) {
        this.supplierName = supplier.name;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Static method to get materials by location
materialSchema.statics.findByLocation = function(coordinates, maxDistance = 25000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates, // [longitude, latitude]
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    isAvailable: true,
  });
};

// Static method to search materials
materialSchema.statics.searchMaterials = function(query, filters = {}) {
  const searchQuery = {
    isAvailable: true,
    ...filters,
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('supplierId', 'name rating isVerified location')
    .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
};

// Instance method to update stock
materialSchema.methods.updateStock = function(quantityUsed) {
  this.quantity = Math.max(0, this.quantity - quantityUsed);
  this.orderCount += 1;
  this.lastOrderDate = new Date();
  return this.save();
};

// Instance method to increment view count
materialSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

const Material = mongoose.model('Material', materialSchema);

export default Material;

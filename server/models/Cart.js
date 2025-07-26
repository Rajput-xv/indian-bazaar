import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'Material ID is required'],
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Supplier ID is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  _id: true,
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100, // Round to 2 decimal places
  },
  estimatedDelivery: {
    type: String,
    trim: true,
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  appliedCoupons: [{
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
  }],
  savedForLater: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
cartSchema.index({ 'items.materialId': 1 });
cartSchema.index({ 'items.supplierId': 1 });
cartSchema.index({ lastModified: 1 });

// Virtual for cart summary
cartSchema.virtual('summary').get(function() {
  const supplierGroups = {};
  
  this.items.forEach(item => {
    const supplierId = item.supplierId.toString();
    if (!supplierGroups[supplierId]) {
      supplierGroups[supplierId] = {
        supplierId,
        items: 0,
        totalAmount: 0,
      };
    }
    supplierGroups[supplierId].items += 1;
    supplierGroups[supplierId].totalAmount += item.totalPrice;
  });

  return {
    totalSuppliers: Object.keys(supplierGroups).length,
    supplierGroups: Object.values(supplierGroups),
    totalItems: this.totalItems,
    totalAmount: this.totalAmount,
  };
});

// Virtual for final amount after discounts
cartSchema.virtual('finalAmount').get(function() {
  let finalAmount = this.totalAmount;
  
  this.appliedCoupons.forEach(coupon => {
    if (coupon.discountType === 'percentage') {
      finalAmount -= (finalAmount * coupon.discount / 100);
    } else {
      finalAmount -= coupon.discount;
    }
  });
  
  finalAmount += this.deliveryFee;
  return Math.max(0, Math.round(finalAmount * 100) / 100);
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalAmount = Math.round(this.totalAmount * 100) / 100;
  this.lastModified = new Date();
  next();
});

// Instance methods
cartSchema.methods.addItem = function(materialId, supplierId, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.materialId.toString() === materialId.toString() && 
           item.supplierId.toString() === supplierId.toString()
  );

  const totalPrice = Math.round((price * quantity) * 100) / 100;

  if (existingItemIndex >= 0) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].totalPrice += totalPrice;
    this.items[existingItemIndex].totalPrice = Math.round(this.items[existingItemIndex].totalPrice * 100) / 100;
  } else {
    // Add new item
    this.items.push({
      materialId,
      supplierId,
      quantity,
      price,
      totalPrice,
    });
  }

  return this.save();
};

cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (quantity <= 0) {
    return this.removeItem(itemId);
  }

  item.quantity = quantity;
  item.totalPrice = Math.round((item.price * quantity) * 100) / 100;

  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items.pull({ _id: itemId });
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupons = [];
  this.deliveryFee = 0;
  this.estimatedDelivery = '';
  return this.save();
};

cartSchema.methods.applyCoupon = function(code, discount, discountType = 'percentage') {
  // Remove existing coupon with same code
  this.appliedCoupons = this.appliedCoupons.filter(coupon => coupon.code !== code);
  
  // Add new coupon
  this.appliedCoupons.push({
    code,
    discount,
    discountType,
  });

  return this.save();
};

cartSchema.methods.removeCoupon = function(code) {
  this.appliedCoupons = this.appliedCoupons.filter(coupon => coupon.code !== code);
  return this.save();
};

cartSchema.methods.saveItemForLater = function(materialId) {
  // Remove from cart items
  this.items = this.items.filter(item => item.materialId.toString() !== materialId.toString());
  
  // Add to saved for later
  const existingSaved = this.savedForLater.find(item => item.materialId.toString() === materialId.toString());
  if (!existingSaved) {
    this.savedForLater.push({ materialId });
  }

  return this.save();
};

cartSchema.methods.moveToCart = function(materialId, quantity, price, supplierId) {
  // Remove from saved for later
  this.savedForLater = this.savedForLater.filter(item => item.materialId.toString() !== materialId.toString());
  
  // Add to cart
  return this.addItem(materialId, supplierId, quantity, price);
};

// Static methods
cartSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId })
    .populate('items.materialId', 'name price unit imageUrl category')
    .populate('items.supplierId', 'name rating location')
    .populate('savedForLater.materialId', 'name price unit imageUrl category');
};

cartSchema.statics.createCart = function(userId) {
  return this.create({
    userId,
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });
};

// Remove expired saved items (older than 30 days)
cartSchema.methods.removeExpiredSavedItems = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  this.savedForLater = this.savedForLater.filter(item => item.savedAt > thirtyDaysAgo);
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;

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

const orderItemSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: [true, 'Material ID is required'],
  },
  materialName: {
    type: String,
    required: [true, 'Material name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    set: v => Math.round(v * 100) / 100,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
    set: v => Math.round(v * 100) / 100,
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
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  _id: true,
});

const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cod', 'online', 'upi', 'card', 'wallet'],
    required: [true, 'Payment method is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
  },
  gatewayOrderId: {
    type: String,
    trim: true,
  },
  gatewayPaymentId: {
    type: String,
    trim: true,
  },
  paidAt: {
    type: Date,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  refundReason: {
    type: String,
    trim: true,
  },
}, {
  _id: false,
});

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  location: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  _id: true,
});

const deliveryDetailsSchema = new mongoose.Schema({
  estimatedDate: {
    type: Date,
  },
  actualDate: {
    type: Date,
  },
  timeSlot: {
    type: String,
    trim: true,
  },
  fee: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  instructions: {
    type: String,
    trim: true,
    maxLength: [500, 'Delivery instructions cannot exceed 500 characters'],
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  courierPartner: {
    type: String,
    trim: true,
  },
}, {
  _id: false,
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendor ID is required'],
  },
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
  },
  items: [orderItemSchema],
  totalItems: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  taxes: {
    type: Number,
    default: 0,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    set: v => Math.round(v * 100) / 100,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  deliveryAddress: {
    type: locationSchema,
    required: true,
  },
  billingAddress: {
    type: locationSchema,
  },
  payment: {
    type: paymentDetailsSchema,
    required: true,
  },
  delivery: {
    type: deliveryDetailsSchema,
    required: true,
  },
  tracking: [trackingSchema],
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
    },
  }],
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxLength: [500, 'Cancellation reason cannot exceed 500 characters'],
  },
  cancelledAt: {
    type: Date,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  supplierNotes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Supplier notes cannot exceed 1000 characters'],
  },
  vendorRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxLength: [500, 'Review cannot exceed 500 characters'],
    },
    ratedAt: {
      type: Date,
    },
  },
  estimatedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for efficient querying
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ 'items.supplierId': 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for checking if order is overdue
orderSchema.virtual('isOverdue').get(function() {
  if (!this.estimatedDelivery) return false;
  return new Date() > this.estimatedDelivery && !['delivered', 'cancelled'].includes(this.status);
});

// Virtual for current tracking status
orderSchema.virtual('currentTracking').get(function() {
  return this.tracking.length > 0 ? this.tracking[this.tracking.length - 1] : null;
});

// Virtual for suppliers involved
orderSchema.virtual('suppliers').get(function() {
  const supplierMap = new Map();
  this.items.forEach(item => {
    if (!supplierMap.has(item.supplierId.toString())) {
      supplierMap.set(item.supplierId.toString(), {
        id: item.supplierId,
        name: item.supplierName,
        items: [],
        totalAmount: 0,
      });
    }
    const supplier = supplierMap.get(item.supplierId.toString());
    supplier.items.push(item);
    supplier.totalAmount += item.totalPrice;
  });
  return Array.from(supplierMap.values());
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Find the last order number for today
    const lastOrder = await this.constructor.findOne({
      orderNumber: new RegExp(`^IBP${year}${month}${day}`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `IBP${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  
  // Update totals
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.subtotal = Math.round(this.subtotal * 100) / 100;
  
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '', location = '') {
  this.status = newStatus;
  
  this.tracking.push({
    status: newStatus,
    updatedBy,
    notes,
    location,
  });
  
  // Update special timestamps
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
    this.delivery.actualDate = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

orderSchema.methods.updatePaymentStatus = function(status, transactionId, gatewayPaymentId) {
  this.payment.status = status;
  if (transactionId) this.payment.transactionId = transactionId;
  if (gatewayPaymentId) this.payment.gatewayPaymentId = gatewayPaymentId;
  if (status === 'paid') this.payment.paidAt = new Date();
  
  return this.save();
};

orderSchema.methods.addRating = function(rating, review) {
  this.vendorRating = {
    rating,
    review,
    ratedAt: new Date(),
  };
  
  return this.save();
};

orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed', 'processing'].includes(this.status);
};

orderSchema.methods.canBeReturned = function() {
  return this.status === 'delivered' && this.ageInDays <= 7;
};

// Static methods
orderSchema.statics.findByVendor = function(vendorId, filters = {}) {
  return this.find({ vendorId, ...filters })
    .populate('items.materialId', 'name imageUrl')
    .populate('items.supplierId', 'name rating location')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findBySupplier = function(supplierId, filters = {}) {
  return this.find({ 
    'items.supplierId': supplierId,
    ...filters 
  })
    .populate('vendorId', 'name phone location')
    .populate('items.materialId', 'name imageUrl')
    .sort({ createdAt: -1 });
};

orderSchema.statics.getOrderStats = function(userId, role, startDate, endDate) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (role === 'vendor') {
    matchStage.vendorId = mongoose.Types.ObjectId(userId);
  } else {
    matchStage['items.supplierId'] = mongoose.Types.ObjectId(userId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

export default Order;

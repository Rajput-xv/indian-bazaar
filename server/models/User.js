import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

const operatingHoursSchema = new mongoose.Schema({
  open: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  close: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
});

const preferencesSchema = new mongoose.Schema({
  preferredCategories: [{
    type: String,
    trim: true,
  }],
  maxDeliveryDistance: {
    type: Number,
    default: 25,
    min: 1,
    max: 100,
  },
  budgetRange: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 10000,
    },
  },
  preferredSuppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  notifications: {
    priceAlerts: {
      type: Boolean,
      default: true,
    },
    stockAlerts: {
      type: Boolean,
      default: true,
    },
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    newSuppliers: {
      type: Boolean,
      default: false,
    },
  },
});

const statisticsSchema = new mongoose.Schema({
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  averageOrderValue: {
    type: Number,
    default: 0,
  },
  favoriteSuppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mostOrderedCategories: [{
    type: String,
  }],
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['vendor', 'supplier'],
    required: [true, 'User role is required'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[1-9][\d\-\(\)\s]{8,15}$/, 'Please enter a valid phone number'],
  },
  businessName: {
    type: String,
    trim: true,
    maxLength: [200, 'Business name cannot exceed 200 characters'],
  },
  businessType: {
    type: String,
    trim: true,
    maxLength: [100, 'Business type cannot exceed 100 characters'],
  },
  location: {
    type: locationSchema,
    required: function() {
      return this.role === 'supplier';
    },
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalOrders: {
    type: Number,
    default: 0,
  },
  // Supplier-specific fields
  deliveryRadius: {
    type: Number,
    default: 25,
    min: 1,
    max: 100,
    required: function() {
      return this.role === 'supplier';
    },
  },
  averageDeliveryTime: {
    type: String,
    default: 'Same day',
    required: function() {
      return this.role === 'supplier';
    },
  },
  minimumOrderAmount: {
    type: Number,
    default: 500,
    min: 0,
    required: function() {
      return this.role === 'supplier';
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  specialties: [{
    type: String,
    trim: true,
  }],
  operatingHours: {
    type: operatingHoursSchema,
    required: function() {
      return this.role === 'supplier';
    },
  },
  // Vendor-specific fields
  preferences: {
    type: preferencesSchema,
    required: function() {
      return this.role === 'vendor';
    },
  },
  statistics: {
    type: statisticsSchema,
    required: function() {
      return this.role === 'vendor';
    },
  },
  // Common fields
  isActive: {
    type: Boolean,
    default: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days
    },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ rating: -1 });
userSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.location) return '';
  return `${this.location.address}, ${this.location.city}, ${this.location.state} - ${this.location.pincode}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.refreshTokens;
  return user;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;

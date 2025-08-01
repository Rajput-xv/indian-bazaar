import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, businessName, location } = req.body;

    // Debug logging
    console.log('Registration request body:', {
      name,
      email,
      role,
      phone,
      businessName,
      location: location ? 'present' : 'missing'
    });

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Prepare user data with role-specific defaults
    const userData = {
      name,
      email,
      password, // Let the model handle password hashing
      role,
      phone,
      businessName,
      location,
    };

    // Add role-specific required fields with defaults
    if (role === 'vendor') {
      userData.preferences = {
        preferredCategories: [],
        maxDeliveryDistance: 25,
        budgetRange: { min: 0, max: 10000 },
        preferredSuppliers: [],
        notifications: {
          priceAlerts: true,
          stockAlerts: true,
          orderUpdates: true,
          newSuppliers: false,
        },
      };
      userData.statistics = {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        favoriteSuppliers: [],
        mostOrderedCategories: [],
      };
    } else if (role === 'supplier') {
      userData.deliveryRadius = 25;
      userData.averageDeliveryTime = 'Same day';
      userData.minimumOrderAmount = 500;
      userData.operatingHours = {
        open: '09:00',
        close: '18:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      };
      userData.specialties = [];
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        businessName: user.businessName,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        businessName: user.businessName,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, businessName, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, businessName, location },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export { register, login, getProfile, updateProfile };

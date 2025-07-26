import User from '../models/User.js';
import Material from '../models/Material.js';

// @desc    Get all suppliers with filtering and pagination
// @route   GET /api/v1/suppliers
// @access  Public
export const getSuppliers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { 
      role: 'supplier',
      isActive: true 
    };

    if (req.query.city) {
      filter['location.city'] = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.state) {
      filter['location.state'] = { $regex: req.query.state, $options: 'i' };
    }

    if (req.query.verified) {
      filter.isVerified = req.query.verified === 'true';
    }

    if (req.query.specialty) {
      filter.specialties = { $in: [req.query.specialty] };
    }

    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = sortOrder;
    } else {
      sort = { rating: -1, totalOrders: -1 };
    }

    const suppliers = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken -refreshTokens')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: suppliers.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      suppliers,
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      error: 'Failed to get suppliers',
      message: error.message,
    });
  }
};

// @desc    Get single supplier by ID
// @route   GET /api/v1/suppliers/:id
// @access  Public
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await User.findOne({
      _id: req.params.id,
      role: 'supplier',
      isActive: true
    }).select('-password -emailVerificationToken -passwordResetToken -refreshTokens');

    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found',
      });
    }

    // Get supplier's materials count and categories
    const materialsData = await Material.aggregate([
      { $match: { supplierId: supplier._id } },
      {
        $group: {
          _id: null,
          totalMaterials: { $sum: 1 },
          categories: { $addToSet: '$category' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    const supplierData = {
      ...supplier.toObject(),
      materialsCount: materialsData[0]?.totalMaterials || 0,
      categories: materialsData[0]?.categories || [],
      averagePrice: materialsData[0]?.avgPrice || 0,
    };

    res.json({
      success: true,
      supplier: supplierData,
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({
      error: 'Failed to get supplier',
      message: error.message,
    });
  }
};

// @desc    Get materials by supplier
// @route   GET /api/v1/suppliers/:id/materials
// @access  Public
export const getSupplierMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if supplier exists
    const supplier = await User.findOne({
      _id: req.params.id,
      role: 'supplier',
      isActive: true
    });

    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found',
      });
    }

    // Build filter
    const filter = { supplierId: req.params.id };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    const materials = await Material.find(filter)
      .populate('supplierId', 'name location rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Material.countDocuments(filter);

    res.json({
      success: true,
      count: materials.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      materials,
      supplier: {
        id: supplier._id,
        name: supplier.name,
        location: supplier.location,
        rating: supplier.rating,
        specialties: supplier.specialties,
      },
    });
  } catch (error) {
    console.error('Get supplier materials error:', error);
    res.status(500).json({
      error: 'Failed to get supplier materials',
      message: error.message,
    });
  }
};

// @desc    Search suppliers
// @route   GET /api/v1/suppliers/search
// @access  Public
export const searchSuppliers = async (req, res) => {
  try {
    const { q, city, state, specialty, minRating } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long',
      });
    }

    const filter = {
      role: 'supplier',
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { businessName: { $regex: q, $options: 'i' } },
        { specialties: { $in: [new RegExp(q, 'i')] } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.state': { $regex: q, $options: 'i' } },
      ],
    };

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    const suppliers = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken -refreshTokens')
      .sort({ rating: -1, totalOrders: -1 })
      .limit(50);

    res.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({
      error: 'Failed to search suppliers',
      message: error.message,
    });
  }
};

// @desc    Get nearby suppliers
// @route   GET /api/v1/suppliers/nearby
// @access  Public
export const getNearbySuppliers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 25 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid latitude or longitude values',
      });
    }

    // Convert radius from kilometers to radians
    const radiusInRadians = radiusInKm / 6371; // Earth's radius in km

    const suppliers = await User.find({
      role: 'supplier',
      isActive: true,
      location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians]
        }
      }
    })
      .select('-password -emailVerificationToken -passwordResetToken -refreshTokens')
      .sort({ rating: -1, totalOrders: -1 });

    // Calculate distance for each supplier
    const suppliersWithDistance = suppliers.map(supplier => {
      const supplierLat = supplier.location.latitude;
      const supplierLng = supplier.location.longitude;
      
      // Haversine formula to calculate distance
      const R = 6371; // Earth's radius in km
      const dLat = (supplierLat - lat) * Math.PI / 180;
      const dLng = (supplierLng - lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat * Math.PI / 180) * Math.cos(supplierLat * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      return {
        ...supplier.toObject(),
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      };
    });

    // Sort by distance
    suppliersWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: suppliersWithDistance.length,
      suppliers: suppliersWithDistance,
      searchCriteria: {
        latitude: lat,
        longitude: lng,
        radius: radiusInKm
      }
    });
  } catch (error) {
    console.error('Get nearby suppliers error:', error);
    res.status(500).json({
      error: 'Failed to get nearby suppliers',
      message: error.message,
    });
  }
};

import Material from '../models/Material.js';
import User from '../models/User.js';

// @desc    Get all materials with filtering and pagination
// @route   GET /api/v1/materials
// @access  Public
export const getMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.supplierId) {
      filter.supplierId = req.query.supplierId;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortBy] = sortOrder;
    } else {
      sort = { createdAt: -1 };
    }

    const materials = await Material.find(filter)
      .populate('supplierId', 'name location rating averageDeliveryTime')
      .sort(sort)
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
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      error: 'Failed to get materials',
      message: error.message,
    });
  }
};

// @desc    Get single material by ID
// @route   GET /api/v1/materials/:id
// @access  Public
export const getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('supplierId', 'name location rating averageDeliveryTime operatingHours');

    if (!material) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }

    res.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      error: 'Failed to get material',
      message: error.message,
    });
  }
};

// @desc    Create new material
// @route   POST /api/v1/materials
// @access  Private (Supplier only)
export const createMaterial = async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      supplierId: req.user.id,
    };

    const material = await Material.create(materialData);
    
    // Populate supplier details
    await material.populate('supplierId', 'name location rating');

    res.status(201).json({
      success: true,
      message: 'Material created successfully',
      material,
    });
  } catch (error) {
    console.error('Create material error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        errors,
      });
    }
    
    res.status(500).json({
      error: 'Failed to create material',
      message: error.message,
    });
  }
};

// @desc    Update material
// @route   PUT /api/v1/materials/:id
// @access  Private (Supplier only)
export const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }

    // Check if user owns this material
    if (material.supplierId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to update this material',
      });
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplierId', 'name location rating');

    res.json({
      success: true,
      message: 'Material updated successfully',
      material: updatedMaterial,
    });
  } catch (error) {
    console.error('Update material error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        errors,
      });
    }
    
    res.status(500).json({
      error: 'Failed to update material',
      message: error.message,
    });
  }
};

// @desc    Delete material
// @route   DELETE /api/v1/materials/:id
// @access  Private (Supplier only)
export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }

    // Check if user owns this material
    if (material.supplierId.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Not authorized to delete this material',
      });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      error: 'Failed to delete material',
      message: error.message,
    });
  }
};

// @desc    Search materials
// @route   GET /api/v1/materials/search
// @access  Public
export const searchMaterials = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, location, radius } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long',
      });
    }

    const filter = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const materials = await Material.find(filter)
      .populate('supplierId', 'name location rating averageDeliveryTime')
      .limit(50);

    res.json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error('Search materials error:', error);
    res.status(500).json({
      error: 'Failed to search materials',
      message: error.message,
    });
  }
};

// @desc    Get materials by category
// @route   GET /api/v1/materials/category/:category
// @access  Public
export const getMaterialsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const materials = await Material.find({ category })
      .populate('supplierId', 'name location rating averageDeliveryTime')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Material.countDocuments({ category });

    res.json({
      success: true,
      count: materials.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      materials,
    });
  } catch (error) {
    console.error('Get materials by category error:', error);
    res.status(500).json({
      error: 'Failed to get materials by category',
      message: error.message,
    });
  }
};

// @desc    Get materials by supplier
// @route   GET /api/v1/materials/supplier/:supplierId
// @access  Public
export const getMaterialsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    // Check if supplier exists
    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'supplier') {
      return res.status(404).json({
        error: 'Supplier not found',
      });
    }

    const materials = await Material.find({ supplierId })
      .populate('supplierId', 'name location rating averageDeliveryTime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      materials,
      supplier: {
        id: supplier._id,
        name: supplier.name,
        location: supplier.location,
        rating: supplier.rating,
      },
    });
  } catch (error) {
    console.error('Get materials by supplier error:', error);
    res.status(500).json({
      error: 'Failed to get materials by supplier',
      message: error.message,
    });
  }
};

// @desc    Compare prices for a material across suppliers
// @route   GET /api/v1/materials/compare/:materialName
// @access  Public
export const comparePrices = async (req, res) => {
  try {
    const { materialName } = req.params;

    const materials = await Material.find({
      name: { $regex: materialName, $options: 'i' }
    })
      .populate('supplierId', 'name location rating averageDeliveryTime')
      .sort({ price: 1 });

    if (materials.length === 0) {
      return res.status(404).json({
        error: 'No materials found with that name',
      });
    }

    // Group by exact name match
    const grouped = materials.reduce((acc, material) => {
      const key = material.name.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(material);
      return acc;
    }, {});

    res.json({
      success: true,
      comparisons: grouped,
    });
  } catch (error) {
    console.error('Compare prices error:', error);
    res.status(500).json({
      error: 'Failed to compare prices',
      message: error.message,
    });
  }
};

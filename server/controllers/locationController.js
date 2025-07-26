import User from '../models/User.js';

// @desc    Get nearby suppliers based on coordinates
// @route   GET /api/v1/location/nearby-suppliers
// @access  Public
export const getNearbySuppliers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 25, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required',
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);
    const maxResults = parseInt(limit);

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
      .limit(maxResults);

    // Calculate distance for each supplier
    const suppliersWithDistance = suppliers.map(supplier => {
      const distance = calculateDistanceBetweenPoints(
        lat, lng,
        supplier.location.latitude,
        supplier.location.longitude
      );

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

// @desc    Calculate distance between two points
// @route   POST /api/v1/location/calculate-distance
// @access  Public
export const calculateDistance = async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to || !from.latitude || !from.longitude || !to.latitude || !to.longitude) {
      return res.status(400).json({
        error: 'From and to coordinates are required with latitude and longitude',
      });
    }

    const distance = calculateDistanceBetweenPoints(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude
    );

    // Calculate estimated delivery time based on distance
    let estimatedTime = 'Same day';
    if (distance > 50) {
      estimatedTime = '2-3 days';
    } else if (distance > 25) {
      estimatedTime = 'Next day';
    } else if (distance > 10) {
      estimatedTime = '4-6 hours';
    } else {
      estimatedTime = '2-4 hours';
    }

    res.json({
      success: true,
      distance: Math.round(distance * 100) / 100,
      unit: 'km',
      estimatedDeliveryTime: estimatedTime,
    });
  } catch (error) {
    console.error('Calculate distance error:', error);
    res.status(500).json({
      error: 'Failed to calculate distance',
      message: error.message,
    });
  }
};

// @desc    Search locations (cities, states)
// @route   GET /api/v1/location/search
// @access  Public
export const searchLocations = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long',
      });
    }

    const searchRegex = new RegExp(q, 'i');
    const aggregationPipeline = [];

    // Match active suppliers
    aggregationPipeline.push({
      $match: {
        role: 'supplier',
        isActive: true
      }
    });

    // Group by location data
    if (type === 'cities' || type === 'all') {
      aggregationPipeline.push({
        $group: {
          _id: {
            city: '$location.city',
            state: '$location.state'
          },
          count: { $sum: 1 },
          coordinates: { $first: '$location' }
        }
      });

      aggregationPipeline.push({
        $match: {
          $or: [
            { '_id.city': searchRegex },
            { '_id.state': searchRegex }
          ]
        }
      });
    }

    aggregationPipeline.push({
      $project: {
        city: '$_id.city',
        state: '$_id.state',
        suppliersCount: '$count',
        coordinates: '$coordinates',
        _id: 0
      }
    });

    aggregationPipeline.push({
      $sort: { suppliersCount: -1 }
    });

    aggregationPipeline.push({
      $limit: 20
    });

    const locations = await User.aggregate(aggregationPipeline);

    res.json({
      success: true,
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({
      error: 'Failed to search locations',
      message: error.message,
    });
  }
};

// @desc    Validate Indian pincode
// @route   GET /api/v1/location/validate-pincode/:pincode
// @access  Public
export const validatePincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    // Basic validation for Indian pincode format
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    
    if (!pincodeRegex.test(pincode)) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Invalid pincode format. Indian pincodes should be 6 digits and cannot start with 0.',
      });
    }

    // Check if any suppliers exist in this pincode area
    const suppliersInArea = await User.countDocuments({
      role: 'supplier',
      isActive: true,
      'location.pincode': pincode
    });

    // Mock data for common Indian cities based on pincode
    const pincodeData = {
      '110001': { city: 'Delhi', state: 'Delhi', district: 'Central Delhi' },
      '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City' },
      '560001': { city: 'Bangalore', state: 'Karnataka', district: 'Bangalore Urban' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai' },
      '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata' },
      '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad' },
    };

    const locationInfo = pincodeData[pincode] || null;

    res.json({
      success: true,
      valid: true,
      pincode,
      locationInfo,
      suppliersCount: suppliersInArea,
      serviceAvailable: suppliersInArea > 0,
    });
  } catch (error) {
    console.error('Validate pincode error:', error);
    res.status(500).json({
      error: 'Failed to validate pincode',
      message: error.message,
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

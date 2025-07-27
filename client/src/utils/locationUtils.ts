import { Location, Material, Supplier } from '../types';

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get user's current location
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: '', // Will be filled by reverse geocoding
          city: '',
          state: '',
          pincode: '',
        };
        resolve(location);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Find nearby suppliers within a given radius
export const findNearbySuppliers = (
  userLocation: Location,
  suppliers: Supplier[],
  radiusKm: number = 50
): Supplier[] => {
  return suppliers.filter(supplier => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      supplier.location.latitude,
      supplier.location.longitude
    );
    
    // Add distance to supplier object for sorting
    supplier.location.distance = distance;
    
    return distance <= radiusKm;
  }).sort((a, b) => (a.location.distance || 0) - (b.location.distance || 0));
};

// Add distance information to materials based on user location
export const addDistanceToMaterials = (
  materials: Material[],
  userLocation: Location
): Material[] => {
  return materials.map(material => {
    if (material.location) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        material.location.latitude,
        material.location.longitude
      );
      return {
        ...material,
        distance,
        deliveryTime: estimateDeliveryTime(distance),
      };
    }
    return material;
  });
};

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distanceKm: number): string => {
  if (distanceKm <= 5) return 'Same day';
  if (distanceKm <= 15) return 'Next day';
  if (distanceKm <= 30) return '1-2 days';
  if (distanceKm <= 50) return '2-3 days';
  return '3-5 days';
};

// Filter materials by location and distance
export const filterMaterialsByLocation = (
  materials: Material[],
  userLocation: Location,
  maxDistanceKm: number = 50
): Material[] => {
  return materials.filter(material => {
    if (!material.location) return false;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      material.location.latitude,
      material.location.longitude
    );
    
    return distance <= maxDistanceKm;
  });
};

// Get location display string
export const getLocationDisplay = (location: Location): string => {
  const parts = [location.city, location.state, location.pincode].filter(Boolean);
  return parts.join(', ');
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Mock reverse geocoding (in real app, use Google Maps API or similar)
export const reverseGeocode = async (latitude: number, longitude: number): Promise<Partial<Location>> => {
  // This is a mock implementation
  // In a real app, you would call a geocoding service
  return {
    address: 'Sample Address',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  };
};

// Basic geocoding using city and state (approximation)
export const geocodeAddress = async (address: string, city: string, state: string, pincode: string): Promise<{ latitude: number; longitude: number }> => {
  // For demo purposes, we'll use approximate coordinates for major Indian cities
  const cityCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
    'mumbai': { latitude: 19.0760, longitude: 72.8777 },
    'delhi': { latitude: 28.7041, longitude: 77.1025 },
    'bangalore': { latitude: 12.9716, longitude: 77.5946 },
    'bengaluru': { latitude: 12.9716, longitude: 77.5946 },
    'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
    'chennai': { latitude: 13.0827, longitude: 80.2707 },
    'kolkata': { latitude: 22.5726, longitude: 88.3639 },
    'pune': { latitude: 18.5204, longitude: 73.8567 },
    'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
    'jaipur': { latitude: 26.9124, longitude: 75.7873 },
    'surat': { latitude: 21.1702, longitude: 72.8311 },
    'lucknow': { latitude: 26.8467, longitude: 80.9462 },
    'kanpur': { latitude: 26.4499, longitude: 80.3319 },
    'nagpur': { latitude: 21.1458, longitude: 79.0882 },
    'indore': { latitude: 22.7196, longitude: 75.8577 },
    'thane': { latitude: 19.2183, longitude: 72.9781 },
    'bhopal': { latitude: 23.2599, longitude: 77.4126 },
    'visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
    'patna': { latitude: 25.5941, longitude: 85.1376 },
    'vadodara': { latitude: 22.3072, longitude: 73.1812 },
  };

  const normalizedCity = city.toLowerCase().trim();
  
  // Try to find exact city match
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }

  // Try to find partial match
  for (const [cityName, coords] of Object.entries(cityCoordinates)) {
    if (cityName.includes(normalizedCity) || normalizedCity.includes(cityName)) {
      return coords;
    }
  }

  // Default fallback - use browser geolocation if available
  try {
    const currentLocation = await getCurrentLocation();
    return {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    };
  } catch (error) {
    console.warn('Could not geocode address or get current location, using default coordinates for Delhi');
    // Default to Delhi coordinates as fallback
    return { latitude: 28.7041, longitude: 77.1025 };
  }
};

// Get delivery fee based on distance
export const calculateDeliveryFee = (distanceKm: number): number => {
  if (distanceKm <= 5) return 0; // Free delivery within 5km
  if (distanceKm <= 15) return 50; // ₹50 for 5-15km
  if (distanceKm <= 30) return 100; // ₹100 for 15-30km
  return 150; // ₹150 for 30km+
};

// Check if supplier delivers to user location
export const canSupplierDeliver = (supplier: Supplier, userLocation: Location): boolean => {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    supplier.location.latitude,
    supplier.location.longitude
  );
  
  return distance <= supplier.deliveryRadius;
}; 
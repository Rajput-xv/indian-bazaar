import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Package, MapPin, Star, Scale, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { DemoModeIndicator } from '../components/common/DemoModeIndicator';
import { MaterialCard } from '../components/vendor/MaterialCard';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { apiClient } from '../lib/api';
import { Material, Location as LocationType } from '../types';
import { getCurrentLocation, addDistanceToMaterials, filterMaterialsByLocation } from '../utils/locationUtils';
import { toast } from '../hooks/use-toast';

export const Materials: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'distance' | 'rating'>('name');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Categories for filtering
  const categories = ['all', ...Array.from(new Set(materials.map(m => m.category)))];

  useEffect(() => {
    // Load materials from API
    const loadMaterials = async () => {
      try {
        setIsLoading(true);
        const materialsResponse = await apiClient.getMaterials();
        if (materialsResponse.success && materialsResponse.materials) {
          setMaterials(materialsResponse.materials);
          setFilteredMaterials(materialsResponse.materials);
        }
      } catch (error) {
        console.error('Error loading materials:', error);
        toast({
          title: "Error",
          description: "Failed to load materials",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // Set user location from profile or get from geolocation as fallback
  useEffect(() => {
    if (user?.location) {
      // Use location from user profile
      setUserLocation({
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        address: user.location.address,
        city: user.location.city,
        state: user.location.state,
        pincode: user.location.pincode,
      });
    } else {
      // Fallback to geolocation if no location in profile
      getCurrentLocation()
        .then(location => {
          setUserLocation(location);
        })
        .catch(error => {
          console.error('Error getting location:', error);
        });
    }
  }, [user]);

  // Add distance to materials when both materials and location are available
  useEffect(() => {
    if (materials.length > 0 && userLocation && !materials[0].distance) {
      const materialsWithDistance = addDistanceToMaterials(materials, userLocation);
      setMaterials(materialsWithDistance);
    }
  }, [materials, userLocation]);

  useEffect(() => {
    // Filter and sort materials
    let filtered = materials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => 
        material.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Price range filter
    filtered = filtered.filter(material => 
      material.price >= priceRange.min && material.price <= priceRange.max
    );

    // Location filter
    if (showLocationFilter && userLocation) {
      filtered = filterMaterialsByLocation(filtered, userLocation, maxDistance);
    }

    // Sort materials
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, selectedCategory, priceRange.min, priceRange.max, maxDistance, showLocationFilter, sortBy, userLocation]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 1000 });
    setShowLocationFilter(false);
    setSortBy('name');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        {/* Demo Mode Indicator */}
        <DemoModeIndicator className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-bold mb-2">
                <span className="hero-text">Raw Materials</span> Marketplace
              </h1>
              <p className="text-muted-foreground">
                Browse fresh ingredients from verified suppliers across India
              </p>
              {userLocation && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {userLocation.address ? 
                      `${userLocation.address}, ${userLocation.city}, ${userLocation.state} ${userLocation.pincode}` : 
                      `${userLocation.city}, ${userLocation.state} ${userLocation.pincode}`
                    }
                  </span>
                </div>
              )}
              {!userLocation && user?.location && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>
                    {user.location.address ? 
                      `${user.location.address}, ${user.location.city}, ${user.location.state} ${user.location.pincode}` : 
                      `${user.location.city}, ${user.location.state} ${user.location.pincode}`
                    }
                  </span>
                </div>
              )}
              {!userLocation && !user?.location && (
                <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                  <MapPin className="w-4 h-4" />
                  <span>Location not set - Update your profile to set delivery location</span>
                </div>
              )}
            </div>
            
            {/* Cart Status */}
            {cart.items.length > 0 && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {getCartItemCount()} items in cart
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{cart.totalAmount?.toFixed(2) || '0.00'} total
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Search */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search materials, suppliers, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={showAdvancedFilters ? "default" : "outline"}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'distance' | 'rating')}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="distance">Distance</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range (₹)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location Filter</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={showLocationFilter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowLocationFilter(!showLocationFilter)}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Nearby
                      </Button>
                      {showLocationFilter && (
                        <select
                          value={maxDistance}
                          onChange={(e) => setMaxDistance(Number(e.target.value))}
                          className="p-2 border border-border rounded-md bg-background"
                        >
                          <option value={10}>10km</option>
                          <option value={25}>25km</option>
                          <option value={50}>50km</option>
                          <option value={100}>100km</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Results Info */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Results</label>
                    <div className="p-2 bg-muted rounded-md">
                      <p className="text-sm font-medium">{filteredMaterials.length} materials</p>
                      <p className="text-xs text-muted-foreground">
                        {searchTerm || selectedCategory !== 'all' ? 'Filtered' : 'Total'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Materials Grid */}
        {isLoading ? (
          <Card className="card-elegant text-center py-12">
            <CardContent>
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Materials</h3>
              <p className="text-muted-foreground">
                Fetching fresh ingredients from suppliers...
              </p>
            </CardContent>
          </Card>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaterials.map(material => (
              <MaterialCard
                key={`${material.id}-${material.supplierId}`}
                material={material}
                userLocation={userLocation || undefined}
              />
            ))}
          </div>
        ) : (
          <Card className="card-elegant text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No materials found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? "Try adjusting your search or filter criteria" 
                  : "Loading fresh materials from our suppliers..."}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                <p>💡 <strong>Tips to find materials:</strong></p>
                <ul className="text-left space-y-1">
                  <li>• Search for specific ingredients like "tomatoes" or "rice"</li>
                  <li>• Filter by category to browse systematically</li>
                  <li>• Use location filter to find nearby suppliers</li>
                  <li>• Adjust price range to match your budget</li>
                </ul>
              </div>
              <Button onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {filteredMaterials.length > 0 && (
          <Card className="card-elegant mt-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{filteredMaterials.length}</p>
                  <p className="text-sm text-muted-foreground">Materials</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {Array.from(new Set(filteredMaterials.map(m => m.supplierId))).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Suppliers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {Array.from(new Set(filteredMaterials.map(m => m.category))).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ₹{Math.min(...filteredMaterials.map(m => m.price))} - ₹{Math.max(...filteredMaterials.map(m => m.price))}
                  </p>
                  <p className="text-sm text-muted-foreground">Price Range</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

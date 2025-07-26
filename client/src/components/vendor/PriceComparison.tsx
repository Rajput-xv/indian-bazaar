import React, { useState } from 'react';
import { Star, MapPin, Clock, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Material, PriceComparison } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { formatDistance } from '../../utils/locationUtils';
import { toast } from '../../hooks/use-toast';

interface PriceComparisonProps {
  comparison: PriceComparison;
  userLocation?: { latitude: number; longitude: number };
}

export const PriceComparisonCard: React.FC<PriceComparisonProps> = ({ comparison, userLocation }) => {
  const { addToCart } = useCart();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddToCart = (supplier: any) => {
    const material: Material = {
      id: comparison.materialId,
      name: comparison.materialName,
      price: supplier.price,
      quantity: supplier.quantity,
      unit: supplier.unit,
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      rating: supplier.rating,
      category: 'Unknown', // This would come from the material data
      location: userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        address: '',
        city: '',
        state: '',
        pincode: '',
        distance: supplier.distance,
      } : undefined,
      deliveryTime: supplier.deliveryTime,
    };

    addToCart(material, 1);
    toast({
      title: "Added to Cart",
      description: `${comparison.materialName} from ${supplier.supplierName} added to cart`,
    });
  };

  const sortedSuppliers = [...comparison.suppliers].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedSuppliers[0]?.price || 0;
  const highestPrice = sortedSuppliers[sortedSuppliers.length - 1]?.price || 0;
  const priceDifference = highestPrice - lowestPrice;

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{comparison.materialName}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Price Range:</span>
            <span className="font-semibold">₹{lowestPrice} - ₹{highestPrice}</span>
            {priceDifference > 0 && (
              <span className="text-xs text-muted-foreground">
                (₹{priceDifference} difference)
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSuppliers.map((supplier, index) => {
            const isLowestPrice = supplier.price === lowestPrice;
            const isHighestPrice = supplier.price === highestPrice;
            const priceDifference = supplier.price - lowestPrice;
            const pricePercentage = lowestPrice > 0 ? ((priceDifference / lowestPrice) * 100) : 0;

            return (
              <div
                key={supplier.supplierId}
                className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                  selectedSupplier === supplier.supplierId
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${isLowestPrice ? 'bg-green-50 border-green-200' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{supplier.supplierName}</span>
                      {isLowestPrice && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Best Price
                        </span>
                      )}
                      {isHighestPrice && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          Highest Price
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">₹{supplier.price}</span>
                      {!isLowestPrice && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{pricePercentage.toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {supplier.unit}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span>{supplier.quantity} {supplier.unit} available</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDistance(supplier.distance)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{supplier.deliveryTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(supplier.rating)}
                    </div>
                    <span className="text-muted-foreground">({supplier.rating})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      supplier.isAvailable ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      {supplier.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(supplier)}
                    disabled={!supplier.isAvailable}
                    className={`${
                      isLowestPrice ? 'btn-gradient' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    size="sm"
                  >
                    {isLowestPrice ? 'Best Deal' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Price Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Lowest Price:</span>
              <div className="font-semibold text-green-600">₹{lowestPrice}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Average Price:</span>
              <div className="font-semibold">
                ₹{(comparison.suppliers.reduce((sum, s) => sum + s.price, 0) / comparison.suppliers.length).toFixed(0)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Price Difference:</span>
              <div className="font-semibold text-red-600">₹{priceDifference}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
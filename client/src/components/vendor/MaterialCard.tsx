import React, { useState } from 'react';
import { Star, Package, MapPin, ShoppingCart, Plus, Minus, MapPinIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Material } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { formatDistance } from '../../utils/locationUtils';

interface MaterialCardProps {
  material: Material;
  userLocation?: { latitude: number; longitude: number };
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, userLocation }) => {
  const { addToCart, isInCart, getCartItem, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const cartItem = getCartItem(material.id);
  const isInCartItem = isInCart(material.id);

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

  const handleAddToCart = async () => {
    if (quantity > material.quantity) {
      return;
    }
    await addToCart(material, quantity);
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= material.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleUpdateCartQuantity = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await updateQuantity(material.id, 0);
    } else if (newQuantity <= material.quantity) {
      await updateQuantity(material.id, newQuantity);
    }
  };

  return (
    <Card className="card-elegant group hover:scale-[1.02] transition-smooth">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                {material.name}
              </h3>
              <p className="text-sm text-muted-foreground">{material.category}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                ₹{material.price}
              </div>
              <div className="text-sm text-muted-foreground">
                per {material.unit}
              </div>
              {material.bulkDiscount && (
                <div className="text-xs text-green-600 font-medium">
                  {material.bulkDiscount}% off on bulk
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {material.description && (
            <p className="text-sm text-muted-foreground">
              {material.description}
            </p>
          )}

          {/* Location and Distance */}
          {material.location && userLocation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {material.location.city}, {material.location.state}
                </span>
              </div>
              {material.distance && (
                <div className="text-sm text-muted-foreground">
                  {formatDistance(material.distance)}
                </div>
              )}
            </div>
          )}

          {/* Supplier Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {material.supplierName}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(Math.floor(material.rating))}
              <span className="text-sm text-muted-foreground ml-1">
                ({material.rating})
              </span>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {material.quantity} {material.unit} available
              </span>
            </div>
            <div className={`spice-badge ${
              material.quantity > 50 ? 'bg-green-100 text-green-700' :
              material.quantity > 20 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {material.quantity > 50 ? 'In Stock' :
               material.quantity > 20 ? 'Limited' : 'Low Stock'}
            </div>
          </div>

          {/* Delivery Time */}
          {material.deliveryTime && (
            <div className="text-sm text-muted-foreground">
              🚚 Delivery: {material.deliveryTime}
            </div>
          )}

          {/* Quantity Selector and Action Button */}
          {isInCartItem && cartItem ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity in cart:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateCartQuantity(cartItem.quantity - 1)}
                    disabled={cartItem.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {cartItem.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateCartQuantity(cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= material.quantity}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: ₹{cartItem.totalPrice || (cartItem.price * cartItem.quantity)}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= material.quantity}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAddToCart}
                className="w-full btn-gradient group-hover:scale-105 transition-smooth"
                disabled={material.quantity === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {material.quantity > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
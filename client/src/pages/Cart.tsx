import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, MapPin, Clock, CreditCard, Truck, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { calculateDeliveryFee, formatDistance } from '../utils/locationUtils';
import { toast } from '../hooks/use-toast';
import { CartItem, Material } from '../types';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to get material data from cart item
  const getMaterialData = (item: CartItem): Material => {
    if (item.material) {
      return item.material;
    }
    if (typeof item.materialId === 'object' && item.materialId) {
      return item.materialId as Material;
    }
    // Fallback to basic data if materialId is just a string
    return {
      id: typeof item.materialId === 'string' ? item.materialId : item._id || 'unknown',
      name: 'Unknown Material',
      category: 'General',
      price: item.price || 0,
      unit: 'unit',
      quantity: 999,
      supplierId: item.supplierId
    } as Material;
  };

  // Helper function to get material ID from cart item
  const getMaterialId = (item: CartItem): string => {
    if (item.material?.id) {
      return item.material.id;
    }
    if (typeof item.materialId === 'object' && item.materialId?.id) {
      return item.materialId.id;
    }
    if (typeof item.materialId === 'string') {
      return item.materialId;
    }
    return item._id || 'unknown';
  };

  const deliveryFee = calculateDeliveryFee(10); // Mock distance
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  const handleQuantityChange = (materialId: string, supplierId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(materialId);
    } else {
      updateQuantity(materialId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery Address Required",
        description: "Please enter your delivery address",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Order Placed Successfully!",
        description: `Your order for ₹${total} has been placed. You will receive a confirmation shortly.`,
      });
      
      clearCart();
      navigate('/materials');
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some raw materials to get started with your order
            </p>
            <Link to="/materials">
              <Button className="btn-gradient">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        <div className="mb-6">
          <Link to="/materials" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Shopping Cart ({cart.items.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.items.map((item) => {
                    const material = getMaterialData(item);
                    const materialId = getMaterialId(item);
                    
                    return (
                      <div key={`${materialId}-${item.supplierId}`} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{material.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {material.category} • {item.supplierName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ₹{material.price} per {material.unit}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(materialId, item.supplierId, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(materialId, item.supplierId, item.quantity + 1)}
                            disabled={item.quantity >= material.quantity}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">₹{item.totalPrice}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(materialId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address..."
                  className="w-full p-3 border border-border rounded-md bg-background resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'online')}
                      className="text-primary"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'online')}
                      className="text-primary"
                    />
                    <span>Online Payment</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full btn-gradient"
              size="lg"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Place Order • ₹{total}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
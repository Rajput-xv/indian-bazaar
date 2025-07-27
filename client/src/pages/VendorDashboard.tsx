import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, TrendingUp, Clock, MapPin, CheckCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { apiClient } from '../lib/api';
import { Order, Location as LocationType } from '../types';
import { getCurrentLocation } from '../utils/locationUtils';
import { toast } from '../hooks/use-toast';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Only show welcome dialog if this is the first time and user is loaded
    if (user?.id && !localStorage.getItem(`vendor_welcomed_${user.id}`)) {
      setShowWelcome(true);
    }
  }, [user?.id]);

  useEffect(() => {
    // Load orders from API
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load vendor orders if user is authenticated
        if (user) {
          const ordersResponse = await apiClient.getVendorOrders();
          if (ordersResponse.success && ordersResponse.orders) {
            setOrders(ordersResponse.orders);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

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

  const stats = [
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: <ShoppingCart className="w-6 h-6" />,
      change: "+12% from last month"
    },
    {
      title: "Cart Items",
      value: getCartItemCount().toString(),
      icon: <Package className="w-6 h-6" />,
      change: cart.items.length > 0 ? "Ready to order" : "Start shopping"
    },
    {
      title: "Total Spent",
      value: `₹${orders.reduce((total, order) => total + (order.totalAmount || 0), 0).toFixed(2)}`,
      icon: <TrendingUp className="w-6 h-6" />,
      change: "+8% from last month"
    },
    {
      title: "Avg. Delivery",
      value: "2.5 days",
      icon: <Clock className="w-6 h-6" />,
      change: "Improved by 15%"
    }
  ];

  return (
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={(open) => {
        setShowWelcome(open);
        if (!open && user?.id) {
          localStorage.setItem(`vendor_welcomed_${user.id}`, 'true');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                🎉 Welcome to Your Vendor Dashboard!
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowWelcome(false);
                  if (user?.id) {
                    localStorage.setItem(`vendor_welcomed_${user.id}`, 'true');
                  }
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Great to have you here, <strong>{user?.name}</strong>! Your dashboard is ready to help you manage your business efficiently.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                View your order analytics and insights
              </li>
              <li className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                Browse materials on the dedicated Materials page
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Track your order history and deliveries
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Find nearby suppliers for faster delivery
              </li>
            </ul>
            <div className="bg-accent/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>New:</strong> Check out the Materials page in the navigation to browse and order fresh ingredients!
              </p>
            </div>
            <Button 
              onClick={() => {
                setShowWelcome(false);
                // Mark this user as welcomed
                if (user?.id) {
                  localStorage.setItem(`vendor_welcomed_${user.id}`, 'true');
                }
              }} 
              className="w-full btn-gradient"
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold mb-2">
              Welcome back, <span className="hero-text">{user?.name}</span>!
            </h1>
            <p className="text-muted-foreground">
              Track your orders, analytics, and business insights
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
                {/* {process.env.NODE_ENV === 'development' && (
                  <span className="text-xs text-orange-500 ml-2">
                    ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                  </span>
                )} */}
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

          {/* Quick Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-elegant hover:scale-105 transition-smooth cursor-pointer" onClick={() => navigate('/materials')}>
              <CardContent className="p-6 text-center">
                <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Browse Materials</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Find fresh ingredients from verified suppliers
                </p>
                <Button className="w-full btn-gradient">
                  Shop Now
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elegant hover:scale-105 transition-smooth cursor-pointer" onClick={() => navigate('/cart')}>
              <CardContent className="p-6 text-center">
                <ShoppingCart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">View Cart</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {getCartItemCount() > 0 ? `${getCartItemCount()} items ready to order` : 'Your cart is empty'}
                </p>
                <Button className="w-full" variant={getCartItemCount() > 0 ? "default" : "outline"}>
                  {getCartItemCount() > 0 ? 'View Cart' : 'Start Shopping'}
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Business Insights</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Track your purchasing patterns and savings
                </p>
                <Button className="w-full" variant="outline">
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="card-elegant shadow-lg">
                <CardContent className="p-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      {stat.change && (
                        <p className={`text-xs ${stat.change.includes('+') ? 'text-green-600' : stat.change.includes('Ready') || stat.change.includes('Improved') ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {stat.change}
                        </p>
                      )}
                    </div>
                    <div className="text-primary scale-125">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analytics Section */}
          <div className="mb-8">
            <Card className="card-elegant shadow-lg">
              <CardHeader>
                <CardTitle>Order Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground">
                      Detailed analytics and insights coming soon...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading your orders...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id || index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.materials?.length || 0} items • ₹{order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{order.status || 'pending'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by browsing materials and adding items to your cart
                  </p>
                  <Button className="btn-gradient" onClick={() => navigate('/materials')}>
                    <Package className="w-4 h-4 mr-2" />
                    Browse Materials
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

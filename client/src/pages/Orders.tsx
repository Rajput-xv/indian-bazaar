import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import { Order } from '../types';
import { toast } from '../hooks/use-toast';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        let response;
        
        if (user?.role === 'vendor') {
          response = await apiClient.getVendorOrders();
        } else if (user?.role === 'supplier') {
          response = await apiClient.getSupplierOrders();
        } else {
          response = await apiClient.getOrders();
        }
        
        if (response.success && response.orders) {
          setOrders(response.orders);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await apiClient.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        ));
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="w-full px-4 py-8">
          <div className="text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(user?.role === 'vendor' ? '/vendor/dashboard' : '/supplier/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            {user?.role === 'vendor' ? 'My Orders' : 'Order Requests'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'vendor' 
              ? 'Track and manage your material orders' 
              : 'Manage incoming order requests from vendors'
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 bg-current text-background rounded-full px-2 py-0.5 text-xs">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="card-elegant">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'all' 
                  ? user?.role === 'vendor' 
                    ? "You haven't placed any orders yet"
                    : "No order requests received yet"
                  : `No ${filter} orders found`
                }
              </p>
              {user?.role === 'vendor' && filter === 'all' && (
                <Button className="btn-gradient" onClick={() => navigate('/materials')}>
                  <Package className="w-4 h-4 mr-2" />
                  Browse Materials
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="card-elegant">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        Order #{order.orderNumber || order.id}
                        {getStatusIcon(order.status)}
                      </h3>
                      <p className="text-muted-foreground">
                        {user?.role === 'vendor' ? 'Vendor Order' : `From: ${order.vendorName}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{order.totalAmount?.toFixed(2)}</p>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Items</p>
                      <p className="font-medium">{(order.items || order.materials)?.length || 0} items</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="font-medium">{order.totalItems || 0}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {(order.items || order.materials)?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.materialName || item.name}</span>
                          <span>{item.quantity} {item.unit || 'units'} × ₹{item.price}</span>
                        </div>
                      ))}
                      {(order.items || order.materials)?.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{(order.items || order.materials).length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {user?.role === 'supplier' && order.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Confirm Order
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {user?.role === 'supplier' && order.status === 'confirmed' && (
                      <Button 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    
                    {user?.role === 'supplier' && order.status === 'shipped' && (
                      <Button 
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

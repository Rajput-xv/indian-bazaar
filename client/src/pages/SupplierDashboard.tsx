import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, TrendingUp, Users, Clock, Edit, Trash2, CheckCircle, Store, BarChart3, ShoppingBag, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { Material, Order } from '../types';
import { apiClient } from '../lib/api';
import { toast } from '../hooks/use-toast';

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem(`supplier_welcomed_${user?.id}`)
  });
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: '',
    category: '',
    description: ''
  });

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Load supplier's materials
      const materialsResponse = await apiClient.getMaterials({ supplierId: user.id });
      if (materialsResponse.success && materialsResponse.materials) {
        setMaterials(materialsResponse.materials);
      }

      // Load supplier's orders
      const ordersResponse = await apiClient.getSupplierOrders();
      if (ordersResponse.success && ordersResponse.orders) {
        setOrders(ordersResponse.orders);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load your materials and orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Your materials and orders have been updated.",
    });
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.price || !newMaterial.quantity || !newMaterial.unit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const materialData = {
        name: newMaterial.name,
        price: parseFloat(newMaterial.price),
        quantity: parseInt(newMaterial.quantity),
        unit: newMaterial.unit,
        category: newMaterial.category || 'General',
        description: newMaterial.description
      };

      const response = await apiClient.createMaterial(materialData);
      
      if (response.success) {
        await loadData(); // Refresh the materials list
        
        setNewMaterial({
          name: '',
          price: '',
          quantity: '',
          unit: '',
          category: '',
          description: ''
        });
        setIsAddDialogOpen(false);

        toast({
          title: "Material Added",
          description: `${materialData.name} has been added to your inventory.`,
        });
      } else {
        throw new Error(response.error || 'Failed to create material');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      toast({
        title: "Error Adding Material",
        description: error instanceof Error ? error.message : "Failed to add material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setNewMaterial({
      name: material.name,
      price: material.price.toString(),
      quantity: material.quantity.toString(),
      unit: material.unit,
      category: material.category,
      description: material.description || ''
    });
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;

    try {
      const materialData = {
        name: newMaterial.name,
        price: parseFloat(newMaterial.price),
        quantity: parseInt(newMaterial.quantity),
        unit: newMaterial.unit,
        category: newMaterial.category || 'General',
        description: newMaterial.description
      };

      const response = await apiClient.updateMaterial(editingMaterial.id, materialData);
      
      if (response.success) {
        await loadData(); // Refresh the materials list
        
        setEditingMaterial(null);
        setNewMaterial({
          name: '',
          price: '',
          quantity: '',
          unit: '',
          category: '',
          description: ''
        });

        toast({
          title: "Material Updated",
          description: `${materialData.name} has been updated successfully.`,
        });
      } else {
        throw new Error(response.error || 'Failed to update material');
      }
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: "Error Updating Material",
        description: error instanceof Error ? error.message : "Failed to update material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await apiClient.deleteMaterial(materialId);
      
      if (response.success) {
        setMaterials(prev => prev.filter(m => m.id !== materialId));

        toast({
          title: "Material Deleted",
          description: "The material has been removed from your inventory.",
        });
      } else {
        throw new Error(response.error || 'Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error Deleting Material",
        description: error instanceof Error ? error.message : "Failed to delete material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'confirmed' | 'delivered') => {
    try {
      const response = await apiClient.updateOrderStatus(orderId, status);
      
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));

        toast({
          title: "Order Updated",
          description: `Order #${orderId} has been marked as ${status}.`,
        });
      } else {
        throw new Error(response.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error Updating Order",
        description: error instanceof Error ? error.message : "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stats = [
    {
      title: "Total Materials",
      value: materials.length.toString(),
      icon: <Package className="w-5 h-5" />,
      change: "+3"
    },
    {
      title: "Pending Orders",
      value: orders.filter(o => o.status === 'pending').length.toString(),
      icon: <Clock className="w-5 h-5" />,
      change: "+2"
    },
    {
      title: "This Month Revenue",
      value: `₹${orders.filter(o => {
        if (!o.createdAt) return false;
        const orderMonth = new Date(o.createdAt).getMonth();
        const currentMonth = new Date().getMonth();
        return orderMonth === currentMonth && o.status === 'delivered';
      }).reduce((sum, o) => sum + (o.totalAmount || 0), 0).toFixed(2)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      change: "+15%"
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      icon: <Users className="w-5 h-5" />,
      change: "+8"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Welcome to Your Supplier Dashboard!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hello <strong>{user?.name}</strong>! You're now logged in as a supplier. Here's what you can do:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                Add and manage your raw materials inventory
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Process incoming orders from vendors
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Track your sales and analytics
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Build relationships with vendor customers
              </li>
            </ul>
            <div className="bg-accent/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Start by adding materials to your inventory to attract vendors!
              </p>
            </div>
            <Button 
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem(`supplier_welcomed_${user?.id}`, 'true');
              }} 
              className="w-full btn-gradient"
            >
              Start Managing Inventory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-poppins font-bold mb-2">
              Welcome back, <span className="hero-text">{user?.name}</span>!
            </h1>
            <p className="text-muted-foreground">
              Manage your inventory and grow your supplier business
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Material
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Material Name *</Label>
                    <Input
                      id="name"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Basmati Rice"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newMaterial.price}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <Input
                        id="unit"
                        value={newMaterial.unit}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="kg, liters, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newMaterial.category}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Grains, Spices, etc."
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddMaterial} className="flex-1 btn-gradient">
                      Add Material
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="card-elegant shadow-lg">
                <CardContent className="p-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="card-elegant shadow-lg">
                <CardContent className="p-8 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change} this month</p>
                    </div>
                    <div className="text-primary scale-125">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Analytics Insights */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">Material Performance</h3>
                <p className="text-sm text-muted-foreground">
                  {materials.length > 0 ? `Most popular: ${materials[0]?.category || 'N/A'}` : 'Add materials to see insights'}
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">Order Trends</h3>
                <p className="text-sm text-muted-foreground">
                  {orders.length > 0 ? `${Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100)}% completion rate` : 'No orders yet'}
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">Growth Potential</h3>
                <p className="text-sm text-muted-foreground">
                  {materials.length < 5 ? 'Add more materials to attract vendors' : 'Great inventory diversity!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Materials Inventory */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Your Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                        <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {materials.map(material => (
                    <div key={material.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {material.category} • ₹{material.price}/{material.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {material.quantity} {material.unit}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditMaterial(material)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No materials yet</h3>
                      <p className="text-muted-foreground mb-4">Start by adding materials to your inventory</p>
                      <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="btn-gradient"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Material
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incoming Orders */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Incoming Orders
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/orders')}
                  className="flex items-center gap-2"
                >
                  View All <ExternalLink className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
                          <div className="h-6 bg-muted rounded animate-pulse w-20"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded animate-pulse w-40 mb-3"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-muted rounded animate-pulse flex-1"></div>
                        <div className="h-8 bg-muted rounded animate-pulse flex-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Order #{order.orderNumber || order.id}</h4>
                          <p className="text-sm text-muted-foreground">
                            From: {order.vendorName || 'Unknown Vendor'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{order.totalAmount || 0}</p>
                          <div className={`spice-badge ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(order.items || order.materials)?.length || 0} items • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            className="flex-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            className="flex-1"
                          >
                            Mark Delivered
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {orders.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Orders will appear here when vendors place them</p>
                      <div className="text-xs text-muted-foreground bg-accent/50 p-3 rounded-lg">
                        💡 <strong>Tip:</strong> Add popular materials with competitive prices to attract more orders
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Material Dialog */}
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Material Name *</Label>
                <Input
                  id="edit-name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹) *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={newMaterial.price}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-quantity">Quantity *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={newMaterial.quantity}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-unit">Unit *</Label>
                  <Input
                    id="edit-unit"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateMaterial} className="flex-1 btn-gradient">
                  Update Material
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingMaterial(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Users, Clock, Edit, Trash2, CheckCircle, Store, BarChart3, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { Material, Order } from '../types';
import { getStoredMaterials, storeMaterials, getStoredOrders, storeOrders } from '../utils/mockData';
import { toast } from '../hooks/use-toast';

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Only show welcome dialog if this is the first time and user is loaded
    if (user?.id && !localStorage.getItem(`supplier_welcomed_${user.id}`)) {
      setShowWelcome(true);
    }
  }, [user?.id]);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    quantity: '',
    unit: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    // Load supplier's materials and incoming orders
    const allMaterials = getStoredMaterials();
    const supplierMaterials = allMaterials.filter(m => m.supplierId === user?.id);
    
    const allOrders = getStoredOrders();
    const supplierOrders = allOrders.filter(order => 
      order.materials.some(item => item.supplierId === user?.id)
    );
    
    setMaterials(supplierMaterials);
    setOrders(supplierOrders);
  }, [user?.id]);

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.price || !newMaterial.quantity || !newMaterial.unit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const material: Material = {
      id: Date.now().toString(),
      name: newMaterial.name,
      price: parseFloat(newMaterial.price),
      quantity: parseInt(newMaterial.quantity),
      unit: newMaterial.unit,
      supplierId: user!.id,
      supplierName: user!.name,
      rating: 4.0, // Default rating
      category: newMaterial.category || 'General',
      description: newMaterial.description
    };

    const allMaterials = getStoredMaterials();
    const updatedMaterials = [...allMaterials, material];
    storeMaterials(updatedMaterials);
    setMaterials(prev => [...prev, material]);

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
      description: `${material.name} has been added to your inventory.`,
    });
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

  const handleUpdateMaterial = () => {
    if (!editingMaterial) return;

    const updatedMaterial: Material = {
      ...editingMaterial,
      name: newMaterial.name,
      price: parseFloat(newMaterial.price),
      quantity: parseInt(newMaterial.quantity),
      unit: newMaterial.unit,
      category: newMaterial.category || 'General',
      description: newMaterial.description
    };

    const allMaterials = getStoredMaterials();
    const updatedMaterials = allMaterials.map(m => 
      m.id === editingMaterial.id ? updatedMaterial : m
    );
    storeMaterials(updatedMaterials);
    
    setMaterials(prev => prev.map(m => 
      m.id === editingMaterial.id ? updatedMaterial : m
    ));

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
      description: `${updatedMaterial.name} has been updated successfully.`,
    });
  };

  const handleDeleteMaterial = (materialId: string) => {
    const allMaterials = getStoredMaterials();
    const updatedMaterials = allMaterials.filter(m => m.id !== materialId);
    storeMaterials(updatedMaterials);
    
    setMaterials(prev => prev.filter(m => m.id !== materialId));

    toast({
      title: "Material Deleted",
      description: "The material has been removed from your inventory.",
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'confirmed' | 'delivered') => {
    const allOrders = getStoredOrders();
    const updatedOrders = allOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    storeOrders(updatedOrders);
    
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));

    toast({
      title: "Order Updated",
      description: `Order #${orderId} has been marked as ${status}.`,
    });
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
        const orderMonth = new Date(o.orderDate).getMonth();
        const currentMonth = new Date().getMonth();
        return orderMonth === currentMonth && o.status === 'delivered';
      }).reduce((sum, o) => sum + o.totalAmount, 0)}`,
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
    <>
      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={(open) => {
        setShowWelcome(open);
        if (!open && user?.id) {
          localStorage.setItem(`supplier_welcomed_${user.id}`, 'true');
        }
      }}>
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
                // Mark this user as welcomed
                if (user?.id) {
                  localStorage.setItem(`supplier_welcomed_${user.id}`, 'true');
                }
              }} 
              className="w-full btn-gradient"
            >
              Start Managing Inventory
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
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

        {/* Stats */}
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
        {/* Future: Analytics section for suppliers */}

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
                {materials.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No materials added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Incoming Orders */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Incoming Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">Order #{order.orderNumber || order.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          From: {order.vendorName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{order.totalAmount}</p>
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
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders received yet</p>
                  </div>
                )}
              </div>
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
    </>
  );
};
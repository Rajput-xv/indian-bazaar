import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Package, TrendingUp, Star, MapPin, Clock, ShoppingCart, BarChart3, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import heroBazaar from '../assets/hero-bazaar.jpg';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartItemCount } = useCart();

  // If user is logged in as vendor, show vendor home
  if (user && user.role === 'vendor') {
    return <VendorHome />;
  }

  // If user is logged in as supplier, show supplier home  
  if (user && user.role === 'supplier') {
    return <SupplierHome />;
  }

  // Default landing page for guests
  return <GuestLanding />;
};

// Guest Landing Page Component
const GuestLanding: React.FC = () => {
  const features = [
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Fresh Raw Materials",
      description: "Direct sourcing from verified suppliers across India"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Bulk Ordering",
      description: "Join bulk orders to get better prices and save costs"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Price Transparency",
      description: "Real-time pricing with no hidden costs or markups"
    },
    {
      icon: <Star className="w-8 h-8 text-primary" />,
      title: "Verified Suppliers",
      description: "All suppliers are verified and rated by the community"
    }
  ];

  const stats = [
    { label: "Active Vendors", value: "5,000+", icon: <Users className="w-5 h-5" /> },
    { label: "Verified Suppliers", value: "1,200+", icon: <Package className="w-5 h-5" /> },
    { label: "Orders Delivered", value: "50,000+", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Cities Covered", value: "25+", icon: <MapPin className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBazaar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold leading-tight mt-20">
                <span className="hero-text">
                  Connect Street Food Vendors
                </span>
                <br />
                <span className="text-foreground">
                  with Quality Suppliers
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join India's largest marketplace for raw materials sourcing. 
                Get fresh ingredients at wholesale prices with trusted suppliers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link to="/auth/vendor">
                <Button className="btn-gradient text-lg px-8 py-4 w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  Start as Vendor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link to="/auth/supplier">
                <Button 
                  variant="outline" 
                  className="text-lg px-8 py-4 w-full sm:w-auto border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Start as Supplier
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="pt-8">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Demo Mode:</strong> Use any email and password (min 6 chars) to explore the platform
              </p>
            </div>

            <div className="pt-8 pb-8">
              <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Trusted by thousands across India
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="card-elegant p-4 text-center transition-smooth hover:scale-105"
                  >
                    <div className="flex items-center justify-center text-primary mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="w-full px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
              Why Choose <span className="hero-text">Indian Bazaar Pro</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing how street food vendors source their raw materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-elegant border-0 text-center p-6 group">
                <CardContent className="p-0 space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-smooth">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--gradient-hero)]">
        <div className="w-full px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-primary-foreground">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of vendors and suppliers who are already benefiting 
              from our platform. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/auth/vendor">
                <Button 
                  variant="secondary" 
                  className="text-lg px-8 py-4 w-full sm:w-auto bg-background hover:bg-background/90"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Vendor Home Component (when vendor is logged in)
const VendorHome: React.FC = () => {
  const { user } = useAuth();
  const { cart, getCartItemCount } = useCart();

  const quickActions = [
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Browse Materials",
      description: "Find fresh ingredients from verified suppliers",
      href: "/materials",
      primary: true
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "View Cart",
      description: `${getCartItemCount()} items in your cart`,
      href: "/cart",
      badge: getCartItemCount() > 0 ? getCartItemCount().toString() : undefined
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Dashboard",
      description: "View analytics and order insights",
      href: "/vendor/dashboard"
    },
    {
      icon: <History className="w-8 h-8 text-primary" />,
      title: "Order History",
      description: "Track your past orders and deliveries",
      href: "/vendor/orders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section for Vendors */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBazaar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        </div>
        
        <div className="relative z-10 w-full px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-poppins font-bold leading-tight">
                Welcome back, <span className="hero-text">{user?.name}</span>!
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your one-stop marketplace for quality raw materials. 
                Start browsing fresh ingredients from trusted suppliers.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <ShoppingCart className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{getCartItemCount()}</p>
                  <p className="text-sm text-muted-foreground">Items in Cart</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm text-muted-foreground">Available Items</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">200+</p>
                  <p className="text-sm text-muted-foreground">Active Suppliers</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">25+</p>
                  <p className="text-sm text-muted-foreground">Cities</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="w-full px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-center mb-12">
              What would you like to do today?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className={`card-elegant group hover:scale-105 transition-smooth h-full ${action.primary ? 'ring-2 ring-primary/20' : ''}`}>
                    <CardContent className="p-6 text-center space-y-4 relative">
                      {action.badge && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          {action.badge}
                        </div>
                      )}
                      <div className="flex justify-center">
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                          {action.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {action.description}
                        </p>
                      </div>
                      {action.primary && (
                        <div className="pt-2">
                          <Button className="w-full btn-gradient">
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Today's Featured Materials */}
      <section className="py-20 bg-muted/50">
        <div className="w-full px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
              Featured Materials Today
            </h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
              Discover today's best deals and fresh arrivals from our trusted suppliers
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { name: "Fresh Tomatoes", price: "₹25/kg", supplier: "Green Farms", discount: "15% OFF" },
                { name: "Basmati Rice", price: "₹85/kg", supplier: "Quality Grains", discount: "BULK DEAL" },
                { name: "Fresh Onions", price: "₹30/kg", supplier: "Farm Direct", discount: "NEW ARRIVAL" }
              ].map((item, index) => (
                <Card key={index} className="card-elegant">
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-1">{item.price}</p>
                    <p className="text-sm text-muted-foreground mb-3">by {item.supplier}</p>
                    <span className="spice-badge bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {item.discount}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Link to="/materials">
              <Button className="btn-gradient text-lg px-8 py-4">
                <Package className="w-5 h-5 mr-2" />
                Browse All Materials
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Supplier Home Component (when supplier is logged in)
const SupplierHome: React.FC = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Manage Inventory",
      description: "Add, edit, and manage your material listings",
      href: "/supplier/dashboard"
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-primary" />,
      title: "Process Orders",
      description: "View and fulfill incoming orders",
      href: "/supplier/orders"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Analytics",
      description: "Track sales and performance metrics",
      href: "/supplier/analytics"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Customer Management",
      description: "Manage relationships with vendors",
      href: "/supplier/customers"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section for Suppliers */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBazaar})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        </div>
        
        <div className="relative z-10 w-full px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-poppins font-bold leading-tight">
                Welcome back, <span className="hero-text">{user?.name}</span>!
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Your supplier dashboard for managing inventory and fulfilling orders. 
                Grow your business with our vendor network.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <Package className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <ShoppingCart className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">150+</p>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                </CardContent>
              </Card>
              <Card className="card-elegant text-center">
                <CardContent className="p-4">
                  <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">₹45K</p>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20">
        <div className="w-full px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-center mb-12">
              Manage Your Business
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className="card-elegant group hover:scale-105 transition-smooth h-full">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        {action.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-smooth">
                          {action.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
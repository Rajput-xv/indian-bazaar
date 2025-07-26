import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Sun, Moon, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { getCartItemCount } = useCart();
  const location = useLocation();

  const cartItemCount = getCartItemCount();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="w-full flex h-16 items-center justify-between px-4 gap-2">
        <Link to="/" className="flex items-center space-x-2" aria-label="Home">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--gradient-primary)] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-poppins font-bold text-xl text-foreground">
              Indian Bazaar
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                {user.role === 'vendor' && (
                  <>
                    <Link
                      to="/materials"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        location.pathname === '/materials' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Materials
                    </Link>
                    <Link
                      to="/vendor/dashboard"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        location.pathname.includes('/vendor') ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                {user.role === 'supplier' && (
                  <Link
                    to="/supplier/dashboard"
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location.pathname.includes('/supplier') ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    Supplier Dashboard
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Cart Icon */}
          {user && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button className="btn-gradient">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
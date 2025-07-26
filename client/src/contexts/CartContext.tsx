import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Material } from '../types';
import { apiClient } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';

interface CartContextType {
  cart: Cart;
  addToCart: (material: Material, quantity?: number) => Promise<void>;
  removeFromCart: (materialId: string) => Promise<void>;
  updateQuantity: (materialId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (materialId: string) => boolean;
  getCartItem: (materialId: string) => CartItem | undefined;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });

  // Load cart from API on mount and when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const response = await apiClient.getCart();
          if (response.success && response.cart) {
            setCart(response.cart);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          setCart({ items: [], totalItems: 0, totalAmount: 0 });
        }
      } else {
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
      }
    };
    
    loadCart();
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;
    
    try {
      const response = await apiClient.getCart();
      if (response.success && response.cart) {
        setCart(response.cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to empty cart on error
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    }
  };

  const addToCart = async (material: Material, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiClient.addToCart(material.id, quantity, material.supplierId);
      if (response.success) {
        await refreshCart();
        toast({
          title: "Added to Cart",
          description: `${material.name} has been added to your cart`,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (materialId: string) => {
    if (!user) return;

    try {
      // Find the cart item to get the itemId
      const cartItem = cart.items.find(item => {
        if (item.material?.id) {
          return item.material.id === materialId;
        }
        if (typeof item.materialId === 'string') {
          return item.materialId === materialId;
        }
        if (typeof item.materialId === 'object' && item.materialId.id) {
          return item.materialId.id === materialId;
        }
        return false;
      });
      if (!cartItem) return;

      // Use the cart item's _id for removal, not the material id
      const itemId = cartItem._id || (typeof cartItem.materialId === 'string' ? cartItem.materialId : cartItem.materialId.id);
      const response = await apiClient.removeFromCart(itemId);
      if (response.success) {
        await refreshCart();
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart",
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  const updateQuantity = async (materialId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(materialId);
      return;
    }

    try {
      // Find the cart item to get the itemId
      const cartItem = cart.items.find(item => {
        if (item.material?.id) {
          return item.material.id === materialId;
        }
        if (typeof item.materialId === 'string') {
          return item.materialId === materialId;
        }
        if (typeof item.materialId === 'object' && item.materialId.id) {
          return item.materialId.id === materialId;
        }
        return false;
      });
      if (!cartItem) return;

      // Use the cart item's _id for updating, not the material id
      const itemId = cartItem._id || (typeof cartItem.materialId === 'string' ? cartItem.materialId : cartItem.materialId.id);
      const response = await apiClient.updateCartItem(itemId, quantity);
      if (response.success) {
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const response = await apiClient.clearCart();
      if (response.success) {
        setCart({ items: [], totalItems: 0, totalAmount: 0 });
        toast({
          title: "Cart Cleared",
          description: "All items have been removed from your cart",
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };

  const getCartItemCount = (): number => {
    return cart.totalItems;
  };

  const getCartTotal = (): number => {
    return cart.totalAmount;
  };

  const isInCart = (materialId: string): boolean => {
    return cart.items.some(item => {
      // Handle both materialId and material.id for compatibility
      if (item.material?.id) {
        return item.material.id === materialId;
      }
      if (typeof item.materialId === 'string') {
        return item.materialId === materialId;
      }
      if (typeof item.materialId === 'object' && item.materialId.id) {
        return item.materialId.id === materialId;
      }
      return false;
    });
  };

  const getCartItem = (materialId: string): CartItem | undefined => {
    return cart.items.find(item => {
      // Handle both materialId and material.id for compatibility
      if (item.material?.id) {
        return item.material.id === materialId;
      }
      if (typeof item.materialId === 'string') {
        return item.materialId === materialId;
      }
      if (typeof item.materialId === 'object' && item.materialId.id) {
        return item.materialId.id === materialId;
      }
      return false;
    });
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemCount,
      getCartTotal,
      isInCart,
      getCartItem,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}; 
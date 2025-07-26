import Cart from '../models/Cart.js';
import Material from '../models/Material.js';

// @desc    Get user's cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.materialId', 'name price unit imageUrl')
      .populate('items.supplierId', 'name location');

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: 'Failed to get cart',
      message: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { materialId, quantity = 1 } = req.body;
    let { supplierId } = req.body;

    if (!materialId) {
      return res.status(400).json({
        error: 'Material ID is required',
      });
    }

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        error: 'Material not found',
      });
    }

    // If supplierId is not provided, get it from the material
    if (!supplierId) {
      supplierId = material.supplierId;
    }

    if (!supplierId) {
      return res.status(400).json({
        error: 'Supplier ID could not be determined',
      });
    }

    // Check if requested quantity is available
    if (quantity > material.quantity) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock',
        availableQuantity: material.quantity,
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.materialId.toString() === materialId && 
        item.supplierId.toString() === supplierId
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > material.quantity) {
        return res.status(400).json({
          error: 'Total quantity exceeds available stock',
          availableQuantity: material.quantity,
          currentCartQuantity: existingItem.quantity,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].totalPrice = material.price * newQuantity;
    } else {
      // Add new item
      cart.items.push({
        materialId,
        supplierId,
        quantity,
        price: material.price,
        totalPrice: material.price * quantity,
        addedAt: new Date(),
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    // Populate cart items for response
    await cart.populate([
      { path: 'items.materialId', select: 'name price unit imageUrl' },
      { path: 'items.supplierId', select: 'name location' },
    ]);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Failed to add item to cart',
      message: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        error: 'Valid quantity is required',
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Item not found in cart',
      });
    }

    const item = cart.items[itemIndex];
    
    // Check material availability
    const material = await Material.findById(item.materialId);
    if (!material) {
      return res.status(404).json({
        error: 'Material no longer available',
      });
    }

    if (quantity > material.quantity) {
      return res.status(400).json({
        error: 'Requested quantity exceeds available stock',
        availableQuantity: material.quantity,
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
    } else {
      // Update item quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = material.price * quantity;
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    // Populate cart items for response
    await cart.populate([
      { path: 'items.materialId', select: 'name price unit imageUrl' },
      { path: 'items.supplierId', select: 'name location' },
    ]);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      error: 'Failed to update cart item',
      message: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Item not found in cart',
      });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    await cart.save();

    // Populate cart items for response
    await cart.populate([
      { path: 'items.materialId', select: 'name price unit imageUrl' },
      { path: 'items.supplierId', select: 'name location' },
    ]);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: 'Failed to remove item from cart',
      message: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/v1/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        error: 'Cart not found',
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;

    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: error.message,
    });
  }
};

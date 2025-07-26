import Order from '../models/Order.js';
import Material from '../models/Material.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (Vendor only)
export const createOrder = async (req, res) => {
  try {
    const { materials, deliveryAddress, notes, paymentMethod = 'cash' } = req.body;

    if (!materials || materials.length === 0) {
      return res.status(400).json({
        error: 'Order must contain at least one material',
      });
    }

    // Validate materials and calculate total
    let totalAmount = 0;
    const orderMaterials = [];

    for (const item of materials) {
      const material = await Material.findById(item.materialId)
        .populate('supplierId', 'name location');

      if (!material) {
        return res.status(404).json({
          error: `Material not found: ${item.materialId}`,
        });
      }

      if (item.quantity > material.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${material.name}. Available: ${material.quantity}`,
        });
      }

      const itemTotal = material.price * item.quantity;
      totalAmount += itemTotal;

      orderMaterials.push({
        materialId: material._id,
        materialName: material.name,
        quantity: item.quantity,
        price: material.price,
        unit: material.unit,
        supplierId: material.supplierId._id,
        supplierName: material.supplierId.name,
        totalPrice: itemTotal,
      });
    }

    // Create order
    const order = await Order.create({
      vendorId: req.user.id,
      vendorName: req.user.name,
      materials: orderMaterials,
      totalAmount,
      status: 'pending',
      orderDate: new Date(),
      deliveryAddress: deliveryAddress || req.user.location,
      paymentStatus: 'pending',
      paymentMethod,
      notes,
    });

    // Update material quantities
    for (const item of materials) {
      await Material.findByIdAndUpdate(
        item.materialId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Clear user's cart if items were ordered from cart
    if (req.body.clearCart) {
      await Cart.findOneAndUpdate(
        { userId: req.user.id },
        { items: [], totalItems: 0, totalAmount: 0 }
      );
    }

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate('vendorId', 'name email phone location')
      .populate('materials.supplierId', 'name location rating');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
};

// @desc    Get all orders for authenticated user
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // Filter based on user role
    if (req.user.role === 'vendor') {
      filter.vendorId = req.user.id;
    } else if (req.user.role === 'supplier') {
      filter['materials.supplierId'] = req.user.id;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('vendorId', 'name email phone location')
      .populate('materials.supplierId', 'name location rating')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      message: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('vendorId', 'name email phone location')
      .populate('materials.supplierId', 'name location rating operatingHours');

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Check if user has access to this order
    const hasAccess = 
      req.user.role === 'vendor' && order.vendorId._id.toString() === req.user.id ||
      req.user.role === 'supplier' && order.materials.some(m => m.supplierId._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      error: 'Failed to get order',
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Supplier only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedDelivery, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Check if supplier has materials in this order
    const hasSupplierMaterials = order.materials.some(
      m => m.supplierId.toString() === req.user.id
    );

    if (!hasSupplierMaterials) {
      return res.status(403).json({
        error: 'Not authorized to update this order',
      });
    }

    // Update order
    const updateData = { status };
    if (estimatedDelivery) updateData.estimatedDelivery = estimatedDelivery;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) updateData.notes = notes;
    if (status === 'delivered') updateData.actualDelivery = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('vendorId', 'name email phone')
      .populate('materials.supplierId', 'name location rating');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
      message: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // Check authorization
    const isVendor = req.user.role === 'vendor' && order.vendorId.toString() === req.user.id;
    const isSupplier = req.user.role === 'supplier' && 
      order.materials.some(m => m.supplierId.toString() === req.user.id);

    if (!isVendor && !isSupplier) {
      return res.status(403).json({
        error: 'Not authorized to cancel this order',
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        error: 'Cannot cancel order that has been shipped or delivered',
      });
    }

    // Restore material quantities
    for (const material of order.materials) {
      await Material.findByIdAndUpdate(
        material.materialId,
        { $inc: { quantity: material.quantity } }
      );
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message,
    });
  }
};

// @desc    Get vendor's orders
// @route   GET /api/v1/orders/vendor/my-orders
// @access  Private (Vendor only)
export const getVendorOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { vendorId: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('materials.supplierId', 'name location rating')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({
      error: 'Failed to get vendor orders',
      message: error.message,
    });
  }
};

// @desc    Get supplier's orders
// @route   GET /api/v1/orders/supplier/my-orders
// @access  Private (Supplier only)
export const getSupplierOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { 'materials.supplierId': req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('vendorId', 'name email phone location')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    console.error('Get supplier orders error:', error);
    res.status(500).json({
      error: 'Failed to get supplier orders',
      message: error.message,
    });
  }
};

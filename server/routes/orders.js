import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getVendorOrders,
  getSupplierOrders
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// General order routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Vendor specific routes
router.get('/vendor/my-orders', authorize('vendor'), getVendorOrders);

// Supplier specific routes
router.get('/supplier/my-orders', authorize('supplier'), getSupplierOrders);
router.put('/:id/status', authorize('supplier'), updateOrderStatus);

export default router;

import express from 'express';
import {
  getSuppliers,
  getSupplierById,
  getSupplierMaterials,
  searchSuppliers,
  getNearbySuppliers
} from '../controllers/supplierController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSuppliers);
router.get('/search', searchSuppliers);
router.get('/nearby', optionalAuth, getNearbySuppliers);
router.get('/:id', getSupplierById);
router.get('/:id/materials', getSupplierMaterials);

export default router;

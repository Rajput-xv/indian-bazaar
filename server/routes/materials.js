import express from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  searchMaterials,
  getMaterialsByCategory,
  getMaterialsBySupplier,
  comparePrices
} from '../controllers/materialController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getMaterials);
router.get('/search', searchMaterials);
router.get('/category/:category', getMaterialsByCategory);
router.get('/supplier/:supplierId', getMaterialsBySupplier);
router.get('/compare/:materialName', comparePrices);
router.get('/:id', getMaterialById);

// Protected routes (require authentication)
router.post('/', authenticate, authorize('supplier'), createMaterial);
router.put('/:id', authenticate, authorize('supplier'), updateMaterial);
router.delete('/:id', authenticate, authorize('supplier'), deleteMaterial);

export default router;

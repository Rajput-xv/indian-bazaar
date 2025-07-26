import express from 'express';
import {
  getNearbySuppliers,
  calculateDistance,
  searchLocations,
  validatePincode
} from '../controllers/locationController.js';

const router = express.Router();

// Public routes
router.get('/nearby-suppliers', getNearbySuppliers);
router.post('/calculate-distance', calculateDistance);
router.get('/search', searchLocations);
router.get('/validate-pincode/:pincode', validatePincode);

export default router;

const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Create a new promo code - Admin only
router.post('/', authenticateAdmin, promoCodeController.createPromoCode);

// Fetch all promo codes - Admin only
router.get('/', authenticateAdmin, promoCodeController.getAllPromoCodes);

// Fetch a single promo code by ID - Admin only
router.get('/:id', authenticateAdmin, promoCodeController.getPromoCodeById);

// Update a promo code by ID - Admin only
router.put('/:id', authenticateAdmin, promoCodeController.updatePromoCode);

// Delete a promo code by ID - Admin only
router.delete('/:id', authenticateAdmin, promoCodeController.deletePromoCode);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const promoCodeController = require('../controllers/promoCodeController');
// const { authenticateAdmin } = require('../middleware/authMiddleware');

// // 1) Create a new promo code - Admin only
// router.post('/', authenticateAdmin, promoCodeController.createPromoCode);

// // 2) Get all promo codes - Could be public or admin-only, you decide
// router.get('/', promoCodeController.getAllPromoCodes);

// // 3) Get a single promo code by ID - Could be public or admin-only, you decide
// router.get('/:id', promoCodeController.getPromoCodeById);

// // 4) Update a promo code by ID - Admin only
// router.put('/:id', authenticateAdmin, promoCodeController.updatePromoCode);

// // 5) Delete a promo code by ID - Admin only
// router.delete('/:id', authenticateAdmin, promoCodeController.deletePromoCode);

// module.exports = router;


const express = require('express');
const router = express.Router();
const promoCodeController = require('../controllers/promoCodeController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Make all routes admin-only by adding authenticateAdmin to everything
router.post('/', authenticateAdmin, promoCodeController.createPromoCode);
router.get('/', authenticateAdmin, promoCodeController.getAllPromoCodes); // Add middleware here
router.get('/:id', authenticateAdmin, promoCodeController.getPromoCodeById); // Add middleware here
router.put('/:id', authenticateAdmin, promoCodeController.updatePromoCode);
router.delete('/:id', authenticateAdmin, promoCodeController.deletePromoCode);

module.exports = router;
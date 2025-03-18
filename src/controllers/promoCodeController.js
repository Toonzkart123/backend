const PromoCode = require('../models/PromoCode');

// CREATE
exports.createPromoCode = async (req, res) => {
  try {
    const {
      code,
      name,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive
    } = req.body;

    // Validate all required fields at the controller level
    if (
      !code ||
      !name ||
      !discountType ||
      discountValue == null ||
      !startDate ||
      !endDate ||
      isActive == null
    ) {
      return res.status(400).json({
        message: 'All fields (code, name, discountType, discountValue, startDate, endDate, isActive) are required.'
      });
    }

    const promoCode = new PromoCode({
      code,
      name,
      discountType,
      discountValue,
      startDate,
      endDate,
      isActive
    });

    await promoCode.save();
    return res.status(201).json({
      message: 'Promo code created successfully',
      promoCode
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// READ (All)
exports.getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    return res.status(200).json(promoCodes);
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

// READ (By ID)
exports.getPromoCodeById = async (req, res) => {
  try {
    const { id } = req.params;
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    return res.status(200).json(promoCode);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};



exports.updatePromoCode = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        name,
        discountType,
        discountValue,
        startDate,
        endDate,
        isActive
      } = req.body;
  
      // Build an object of only the fields that the admin wants to update
      const updates = {};
  
      if (code !== undefined) updates.code = code;
      if (name !== undefined) updates.name = name;
      if (discountType !== undefined) updates.discountType = discountType;
      if (discountValue !== undefined) updates.discountValue = discountValue;
      if (startDate !== undefined) updates.startDate = startDate;
      if (endDate !== undefined) updates.endDate = endDate;
      if (isActive !== undefined) updates.isActive = isActive;
  
      // If no fields to update were provided:
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          message: 'No fields provided for update.'
        });
      }
  
      // Perform partial update
      const updatedPromo = await PromoCode.findByIdAndUpdate(
        id,
        updates,
        { new: true } // returns the updated document
      );
  
      if (!updatedPromo) {
        return res.status(404).json({ message: 'Promo code not found.' });
      }
  
      return res.status(200).json({
        message: 'Promo code updated successfully.',
        updatedPromo
      });
    } catch (error) {
      console.error('Error updating promo code:', error);
      return res.status(500).json({ message: 'Internal server error', error });
    }
  };
  



// DELETE
exports.deletePromoCode = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPromo = await PromoCode.findByIdAndDelete(id);
    if (!deletedPromo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }
    return res.status(200).json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
};
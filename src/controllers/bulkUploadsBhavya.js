const xlsx = require('xlsx');
const Stationery = require('../models/stationeryModel');

// Bulk upload Stationery
exports.uploadStationery = async (req, res) => {
  try {
    // Read the Excel file from the uploaded buffer; defval ensures empty cells become ""
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    console.log('Parsed Excel data:', sheetData);

    let validStationery = [];
    let errors = [];

    sheetData.forEach((row, index) => {
      // Skip completely empty rows
      if (Object.values(row).every(val => val === "")) {
        return;
      }

      // Read fields using various header name fallbacks
      const name = row['name'] || row['Name'] || row['Product Name'] || "";
      const codeValue = row['code'] || row['Code'] || "";
      const priceValue = row['price'] || row['Price'] || row['Product Price'] || "";
      const stockValue = row['stock'] || row['Stock'] || row['Stock Count'] || "";
      // Category is not required in the schema, so we default to "Other" if not provided
      const category = row['category'] || row['Category'] || row['Product Category'] || "Other";
      const brand = row['brand'] || row['Brand'] || "";
      const description = row['description'] || row['Description'] || "";
      const material = row['material'] || row['Material'] || "";
      const color = row['color'] || row['Color'] || "";

      // Check for required fields (name, code, price, stock)
      if (!name || !codeValue || !priceValue || !stockValue) {
        errors.push(
          `Row ${index + 2}: Missing one or more required fields (name, code, price, stock).`
        );
        return;
      }

      // Process discount: convert "NA", empty, or undefined to 0
      let discountValue = row['discount'] || row['Discount'];
      if (discountValue === 'NA' || discountValue === '' || discountValue === undefined) {
        discountValue = 0;
      } else {
        discountValue = Number(discountValue);
        if (isNaN(discountValue)) discountValue = 0;
      }

      // Process status: map "Available" to "In Stock" and default any unexpected value to "In Stock"
      let statusValue = row['status'] || row['Status'] || "";
      if (statusValue === 'Available') {
        statusValue = 'In Stock';
      }
      if (statusValue !== 'In Stock' && statusValue !== 'Out of Stock') {
        statusValue = 'In Stock';
      }

      // Build the stationery object based on the schema
      const stationeryObj = {
        name,
        brand,
        category,
        description,
        price: Number(priceValue),
        originalPrice: Number(row['originalPrice'] || row['Original Price']) || 0,
        discount: discountValue,
        stock: Number(stockValue),
        status: statusValue,
        material,
        color,
        code: Number(codeValue),
        image: row['image'] || row['Image'] || row['Product Image'] || undefined,
      };

      validStationery.push(stationeryObj);
    });

    // If any row had missing required fields, return errors instead of inserting incomplete data
    if (errors.length > 0) {
      return res.status(400).json({ message: "Some rows are missing required fields.", errors });
    }

    // Insert all valid stationery items in bulk
    await Stationery.insertMany(validStationery);
    res.status(200).json({ message: 'Stationery items uploaded successfully' });
  } catch (error) {
    console.error('Error uploading stationery:', error);
    res.status(500).json({ message: 'Error uploading stationery', error });
  }
};

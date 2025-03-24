const xlsx = require('xlsx');
const Stationery = require('../models/stationeryModel');
const Store = require('../models/storeModel');
const School = require('../models/schoolModel');
const Book = require('../models/bookModel');


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

// exports.uploadStores = async (req, res) => {
//   try {
//     // Read the file from the uploaded buffer (Excel or CSV)
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     // Convert the sheet to JSON; defval: "" ensures empty cells become empty strings.
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

//     console.log("Parsed Excel data:", sheetData);
    
//     let validStores = [];
//     let errors = [];
    
//     // Use a for-of loop so we can await DB operations
//     for (let [index, row] of sheetData.entries()) {
//       const storeName = row['Name of the shop'];
//       const managerName = row['Owner Name'];
//       const phoneNumber = row['Contact Number'];
//       const address = row['Address'];

//       // Check required fields
//       if (!storeName || !managerName || !phoneNumber || !address) {
//         errors.push(`Row ${index + 2}: Missing required fields (Name of the shop, Owner Name, Contact Number, Address).`);
//         continue;
//       }
      
//       let storeObj = {
//         storeName,
//         managerName,
//         phoneNumber,
//         address,
//         email: row['Email'] || "",
//         status: row['Status'] || "Pending",
//         website: row['Website'] || "",
//         storeHours: row['Store Hours'] || "",
//         image: row['Image'] || "",
//         description: row['Description'] || "",
//         commissionRate: Number(row['Commission Rate']) || 0,
//         paymentTerms: row['Payment Terms'] || "",
//         schools: [],
//         inventory: []
//       };

//       // Process School Names (comma-separated list)
//       if (row['School Names']) {
//         let schoolNames = row['School Names']
//           .split(',')
//           .map(s => s.trim())
//           .filter(Boolean);
//         for (const sName of schoolNames) {
//           const school = await School.findOne({ name: sName });
//           if (school) {
//             storeObj.schools.push(school._id);
//           } else {
//             console.log(`No school found for name: ${sName}`);
//           }
//         }
//       }
      
//       // Process Inventory from the 'isbn' column (single value)
//       if (row['isbn']) {
//         let isbnVal = row['isbn'];
//         // Convert to string if necessary
//         if (typeof isbnVal !== "string") {
//           isbnVal = isbnVal.toString();
//         }
//         console.log(`Looking up book with ISBN: ${isbnVal}`);
//         const book = await Book.findOne({ isbn: isbnVal });
//         if (book) {
//           console.log(`Found book for ISBN ${isbnVal}: ${book.title}`);
//           storeObj.inventory.push({
//             book: book._id,
//             price: book.price || 0,
//             quantity: 0
//           });
//         } else {
//           console.log(`No book found for ISBN: ${isbnVal}`);
//         }
//       }
      
//       validStores.push(storeObj);
//     }
    
//     if (errors.length > 0) {
//       return res.status(400).json({ message: "Some rows are missing required fields.", errors });
//     }
    
//     await Store.insertMany(validStores);
//     res.status(200).json({ message: "Stores uploaded successfully" });
//   } catch (error) {
//     console.error("Error uploading stores:", error);
//     res.status(500).json({ message: "Error uploading stores", error });
//   }
// };








// exports.uploadStores = async (req, res) => {
//   try {
//     // Read the file from the uploaded buffer (Excel or CSV)
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     // Convert the sheet to JSON; defval: "" ensures empty cells become empty strings.
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
//     console.log("Parsed Excel data:", sheetData);
    
//     let validStores = [];
//     let errors = [];
    
//     // Process each row with a for-of loop to allow awaiting inside
//     for (let [index, row] of sheetData.entries()) {
//       const storeName = row['Name of the shop'];
//       const managerName = row['Owner Name'];
//       const phoneNumber = row['Contact Number'];
//       const address = row['Address'];

//       // Check required fields
//       if (!storeName || !managerName || !phoneNumber || !address) {
//         errors.push(`Row ${index + 2}: Missing required fields (Name of the shop, Owner Name, Contact Number, Address).`);
//         continue;
//       }

//         // Process Email: if missing, generate a unique dummy email using the row index and timestamp.
//         let email = row['Email'];
//         if (!email) {
//           email = `store_${index}_${Date.now()}@dummy.com`;
//           console.log(`No email provided for row ${index + 2}, generated dummy email: ${email}`);
//         }
      
//       let storeObj = {
//         storeName,
//         managerName,
//         phoneNumber,
//         address,
//         email: row['Email'] || "",
//         status: row['Status'] || "Pending",
//         website: row['Website'] || "",
//         storeHours: row['Store Hours'] || "",
//         image: row['Image'] || "",
//         description: row['Description'] || "",
//         commissionRate: Number(row['Commission Rate']) || 0,
//         paymentTerms: row['Payment Terms'] || "",
//         schools: [],
//         inventory: []
//       };

//       // Process School Names (supports multiple comma-separated values)
//       if (row['School Names']) {
//         let schoolNames = row['School Names']
//           .split(',')
//           .map(s => s.trim())
//           .filter(Boolean);
//         console.log(`Row ${index + 2} - School Names:`, schoolNames);
//         for (const sName of schoolNames) {
//           console.log(`Looking up school with name: "${sName}"`);
//           const school = await School.findOne({ name: sName });
//           if (school) {
//             console.log(`Found school: "${sName}" with id: ${school._id}`);
//             storeObj.schools.push(school._id);
//           } else {
//             console.log(`No school found for name: "${sName}"`);
//           }
//         }
//       }
      
//       // Process Inventory from the 'isbn' column (supports multiple comma-separated values)
//       if (row['isbn']) {
//         let isbnRaw = row['isbn'];
//         let isbnList = [];
//         if (typeof isbnRaw === 'string' && isbnRaw.includes(',')) {
//           isbnList = isbnRaw.split(',').map(val => val.trim()).filter(Boolean);
//         } else {
//           isbnList.push(isbnRaw.toString().trim());
//         }
//         for (const isbn of isbnList) {
//           console.log(`Looking up book with ISBN: "${isbn}"`);
//           const book = await Book.findOne({ isbn: isbn });
//           if (book) {
//             console.log(`Found book for ISBN "${isbn}": ${book.title}`);
//             storeObj.inventory.push({
//               book: book._id,
//               price: book.price || 0,
//               quantity: 0
//             });
//           } else {
//             console.log(`No book found for ISBN: "${isbn}"`);
//           }
//         }
//       }
      
//       validStores.push(storeObj);
//     }
    
//     if (errors.length > 0) {
//       return res.status(400).json({ message: "Some rows are missing required fields.", errors });
//     }
    
//     await Store.insertMany(validStores);
//     res.status(200).json({ message: "Stores uploaded successfully" });
//   } catch (error) {
//     console.error("Error uploading stores:", error);
//     res.status(500).json({ message: "Error uploading stores", error });
//   }
// };








exports.uploadStores = async (req, res) => {
  try {
    // Read the file from the uploaded buffer (Excel or CSV)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    // Convert the sheet to JSON; defval: "" ensures empty cells become empty strings.
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });
    console.log("Parsed Excel data:", sheetData);
    
    let validStores = [];
    let errors = [];
    
    // Process each row with a for-of loop to support async/await
    for (let [index, row] of sheetData.entries()) {
      const storeName = row['Name of the shop'];
      const managerName = row['Owner Name'];
      const phoneNumber = row['Contact Number'];
      const address = row['Address'];

      // Check required fields
      if (!storeName || !managerName || !phoneNumber || !address) {
        errors.push(`Row ${index + 2}: Missing required fields (Name of the shop, Owner Name, Contact Number, Address).`);
        continue;
      }
      
      // Process Email: if missing, generate a unique dummy email using the row index and timestamp.
      let email = row['Email'];
      if (!email) {
        email = `store_${index}_${Date.now()}@dummy.com`;
        console.log(`No email provided for row ${index + 2}, generated dummy email: ${email}`);
      }
      
      let storeObj = {
        storeName,
        managerName,
        phoneNumber,
        address,
        email,
        status: row['Status'] || "Pending",
        website: row['Website'] || "",
        storeHours: row['Store Hours'] || "",
        image: row['Image'] || "",
        description: row['Description'] || "",
        commissionRate: Number(row['Commission Rate']) || 0,
        paymentTerms: row['Payment Terms'] || "",
        schools: [],
        inventory: []
      };

      // Process School Names (supports multiple comma-separated values)
      if (row['School Names']) {
        let schoolNames = row['School Names']
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
        console.log(`Row ${index + 2} - School Names:`, schoolNames);
        for (const sName of schoolNames) {
          console.log(`Looking up school with name: "${sName}"`);
          const school = await School.findOne({ name: sName });
          if (school) {
            console.log(`Found school: "${sName}" with id: ${school._id}`);
            storeObj.schools.push(school._id);
          } else {
            console.log(`No school found for name: "${sName}"`);
          }
        }
      }
      
      // Process Inventory from the 'isbn' column (supports multiple comma-separated values)
      if (row['isbn']) {
        let isbnRaw = row['isbn'];
        let isbnList = [];
        if (typeof isbnRaw === 'string' && isbnRaw.includes(',')) {
          isbnList = isbnRaw.split(',').map(val => val.trim()).filter(Boolean);
        } else {
          isbnList.push(isbnRaw.toString().trim());
        }
        for (const isbn of isbnList) {
          console.log(`Looking up book with ISBN: "${isbn}"`);
          const book = await Book.findOne({ isbn: isbn });
          if (book) {
            console.log(`Found book for ISBN "${isbn}": ${book.title}`);
            storeObj.inventory.push({
              book: book._id,
              price: book.price || 0,
              quantity: 0
            });
          } else {
            console.log(`No book found for ISBN: "${isbn}"`);
          }
        }
      }
      
      validStores.push(storeObj);
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ message: "Some rows are missing required fields.", errors });
    }
    
    await Store.insertMany(validStores);
    res.status(200).json({ message: "Stores uploaded successfully" });
  } catch (error) {
    console.error("Error uploading stores:", error);
    res.status(500).json({ message: "Error uploading stores", error });
  }
};

// controllers/bulkUploads.js
const xlsx = require('xlsx');
const Book = require('../models/bookModel')
const School = require('../models/schoolModel');
const Stationery = require('../models/stationeryModel');
const Store = require('../models/storeModel');




// // Bulk upload Books
// exports.uploadBooks = async (req, res) => {
//   try {
//     // Read the Excel file from the uploaded buffer, using defval so empty cells become ""
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

//     console.log('Parsed Excel data:', sheetData);

//     let validBooks = [];
//     let errors = [];

//     sheetData.forEach((row, index) => {
//       // Extract required fields (check for both lowercase and capitalized header versions)
//       const title = row['title'] || row['Title'] || "";
//       const author = row['author'] || row['Author'] || "";
//       const isbn = row['isbn'] || row['ISBN'] || "";
//       const category = row['category'] || row['Category'] || "";
//       const priceValue = row['price'] || row['Price'] || "";
//       const stockValue = row['stock'] || row['Stock'] || "";

//       // If any required field is missing, log an error for that row and skip processing it
//       if (!title || !author || !isbn || !category || !priceValue || !stockValue) {
//         errors.push(
//           `Row ${index + 2}: Missing one or more required fields (title, author, isbn, category, price, stock).`
//         );
//         return; // Skip this row
//       }

//       // Process discount: convert "NA" or empty values to 0
//       let discountValue = row['discount'] || row['Discount'];
//       if (discountValue === 'NA' || discountValue === '' || discountValue === undefined) {
//         discountValue = 0;
//       } else {
//         discountValue = Number(discountValue);
//         if (isNaN(discountValue)) discountValue = 0;
//       }

//       // Parse publishDate; if invalid, set to null
//       let rawDate = row['publisheddate'] || row['PublishDate'] || row['Publish Date'] || "";
//       let parsedDate = new Date(rawDate);
//       if (isNaN(parsedDate)) {
//         parsedDate = null;
//       }

//       // Map status to valid enum values (allowed: "In Stock", "Out of Stock")
//       let statusValue = row['status'] || row['Status'] || "";
//       if (statusValue === 'Available') {
//         statusValue = 'In Stock';
//       }
//       if (statusValue !== 'In Stock' && statusValue !== 'Out of Stock') {
//         statusValue = 'In Stock';
//       }

//       // Build the book object; note that category, pages, and image are taken as is
//       const bookObj = {
//         title,
//         author,
//         isbn,
//         category, // if empty, remains empty and Mongoose will trigger a validation error
//         description: row['description'] || row['Description'] || "",
//         price: Number(priceValue),
//         originalPrice: Number(row['original price'] || row['Original Price']) || 0,
//         discount: discountValue,
//         stock: Number(stockValue),
//         status: statusValue,
//         publisher: row['publisher'] || row['Publisher'] || "",
//         publishDate: parsedDate,
//         language: row['language'] || row['Language'] || 'English',
//         // For pages: if empty, leave it undefined so that Mongoose default (0) can apply
//         pages: (row['pages'] || row['Pages']) ? Number(row['pages'] || row['Pages']) : undefined,
//         // For image: if empty, remain as empty string or undefined
//         image: row['image'] || row['Image'] || undefined,
//       };

//       validBooks.push(bookObj);
//     });

//     // If any row had missing required fields, return errors instead of inserting incomplete data
//     if (errors.length > 0) {
//       return res.status(400).json({ message: "Some rows are missing required fields.", errors });
//     }

//     // Insert all valid books in bulk
//     await Book.insertMany(validBooks);
//     res.status(200).json({ message: 'Books uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading books:', error);
//     res.status(500).json({ message: 'Error uploading books', error });
//   }
// };





// Bulk upload Books
exports.uploadBooks = async (req, res) => {
  try {
    // Read the Excel file from the uploaded buffer, using defval so empty cells become ""
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    let validBooks = [];
    let errors = [];

    sheetData.forEach((row, index) => {
      // Extract required fields (checking for both lowercase and capitalized header versions)
      const title = row['title'] || row['Title'] || "";
      const author = row['author'] || row['Author'] || "";
      const isbn = row['isbn'] || row['ISBN'] || "";
      // Category is now optional. If it's empty, it will be stored as an empty string.
      const category = row['category'] || row['Category'] || "";
      const priceValue = row['price'] || row['Price'] || "";
      const stockValue = row['stock'] || row['Stock'] || "";

      // Check required fields except category
      if (!title || !author || !isbn || !priceValue || !stockValue) {
        errors.push(
          `Row ${index + 2}: Missing one or more required fields (title, author, isbn, price, stock).`
        );
        return; // Skip this row
      }

      // Process discount: convert "NA" or empty values to 0
      let discountValue = row['discount'] || row['Discount'];
      if (discountValue === 'NA' || discountValue === '' || discountValue === undefined) {
        discountValue = 0;
      } else {
        discountValue = Number(discountValue);
        if (isNaN(discountValue)) discountValue = 0;
      }

      // Parse publishDate; if invalid, set to null
      let rawDate = row['publisheddate'] || row['PublishDate'] || row['Publish Date'] || "";
      let parsedDate = new Date(rawDate);
      if (isNaN(parsedDate)) {
        parsedDate = null;
      }

      // Map status to valid enum values (allowed: "In Stock", "Out of Stock")
      let statusValue = row['status'] || row['Status'] || "";
      if (statusValue === 'Available') {
        statusValue = 'In Stock';
      }
      if (statusValue !== 'In Stock' && statusValue !== 'Out of Stock') {
        statusValue = 'In Stock';
      }

      // Build the book object; note that category, pages, and image are taken as is
      const bookObj = {
        title,
        author,
        isbn,
        category, // optional now; if empty, remains empty
        description: row['description'] || row['Description'] || "",
        price: Number(priceValue),
        originalPrice: Number(row['original price'] || row['Original Price']) || 0,
        discount: discountValue,
        stock: Number(stockValue),
        status: statusValue,
        publisher: row['publisher'] || row['Publisher'] || "",
        publishDate: parsedDate,
        language: row['language'] || row['Language'] || 'English',
        // For pages: if empty, leave it undefined so that the Mongoose default (0) can apply
        pages: (row['pages'] || row['Pages']) ? Number(row['pages'] || row['Pages']) : undefined,
        // For image: if empty, remain as empty string or undefined
        image: row['image'] || row['Image'] || undefined,
      };

      validBooks.push(bookObj);
    });

    // If any row had missing required fields, return errors instead of inserting incomplete data
    if (errors.length > 0) {
      return res.status(400).json({ message: "Some rows are missing required fields.", errors });
    }

    // Insert all valid books in bulk
    await Book.insertMany(validBooks);
    res.status(200).json({ message: 'Books uploaded successfully' });
  } catch (error) {
    console.error('Error uploading books:', error);
    res.status(500).json({ message: 'Error uploading books', error });
  }
};

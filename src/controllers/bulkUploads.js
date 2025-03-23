// controllers/bulkUploads.js
const xlsx = require('xlsx');
const Book = require('../models/bookModel')
const School = require('../models/schoolModel');
const Stationery = require('../models/stationeryModel');
const Store = require('../models/storeModel');



// // Bulk upload Books
// exports.uploadBooks = async (req, res) => {
//   try {
//     // Read the Excel file from the uploaded buffer
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//     const sheetName = workbook.SheetNames[0];
//     const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     const booksToInsert = sheetData.map((row) => {
//       // Handle 'discount' which should be a number
//       let discountValue = row['discount'];
//       if (discountValue === 'NA' || discountValue === '' || discountValue === undefined) {
//         discountValue = 0;
//       } else {
//         discountValue = Number(discountValue);
//         if (isNaN(discountValue)) discountValue = 0; // fallback
//       }

//       // Parse 'publishDate' and set null if invalid
//       let rawDate = row['publisheddate']; // from your Excel header
//       let parsedDate = new Date(rawDate);
//       if (isNaN(parsedDate)) {
//         parsedDate = null;
//       }

//       // Map 'status' to valid enum values
//       // Your schema enum: ["In Stock", "Out of Stock"]
//       let statusValue = row['status'];
//       if (statusValue === 'Available') {
//         // Example: treat "Available" as "In Stock"
//         statusValue = 'In Stock';
//       }
//       // If it's still not one of the allowed values, default to "In Stock"
//       if (statusValue !== 'In Stock' && statusValue !== 'Out of Stock') {
//         statusValue = 'In Stock';
//       }

//       return {
//         title: row['title'],
//         author: row['author'],
//         isbn: row['isbn'],
//         // If category is empty, default to "Unknown"
//         category: row['category'] || "Unknown",
//         description: row['description'],

//         // Convert these to numbers or default to 0
//         price: Number(row['price']) || 0,
//         originalPrice: Number(row['original price']) || 0,
//         discount: discountValue,
//         stock: Number(row['stock']) || 0,

//         status: statusValue,
//         // If your Excel doesn't have 'publisher', default to an empty string
//         publisher: row['publisher'] || '',
//         publishDate: parsedDate,
//         language: row['language'] || 'English',
//         pages: Number(row['pages']) || 0,
//         // If image is empty, default to an empty string
//         image: row['image'] || '',
//       };
//     });

//     // Insert all books in bulk
//     await Book.insertMany(booksToInsert);
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
      // Extract required fields (check for both lowercase and capitalized header versions)
      const title = row['title'] || row['Title'] || "";
      const author = row['author'] || row['Author'] || "";
      const isbn = row['isbn'] || row['ISBN'] || "";
      const category = row['category'] || row['Category'] || "";
      const priceValue = row['price'] || row['Price'] || "";
      const stockValue = row['stock'] || row['Stock'] || "";

      // If any required field is missing, log an error for that row and skip processing it
      if (!title || !author || !isbn || !category || !priceValue || !stockValue) {
        errors.push(
          `Row ${index + 2}: Missing one or more required fields (title, author, isbn, category, price, stock).`
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
        category, // if empty, remains empty and Mongoose will trigger a validation error
        description: row['description'] || row['Description'] || "",
        price: Number(priceValue),
        originalPrice: Number(row['original price'] || row['Original Price']) || 0,
        discount: discountValue,
        stock: Number(stockValue),
        status: statusValue,
        publisher: row['publisher'] || row['Publisher'] || "",
        publishDate: parsedDate,
        language: row['language'] || row['Language'] || 'English',
        // For pages: if empty, leave it undefined so that Mongoose default (0) can apply
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

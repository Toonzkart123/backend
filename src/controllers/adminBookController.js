const Book = require("../models/bookModel");
const fs = require("fs"); // Import for file deletion

// 🔹 Add a New Book (Admin Only)
exports.addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      description,
      price,
      originalPrice,
      discount,
      stock,
      status,
      publisher,
      publishDate,
      language,
      pages,
    } = req.body;

        // Convert string values to numbers
        const parsedPrice = parseFloat(price);
        const parsedOriginalPrice = parseFloat(originalPrice);
        const parsedDiscount = parseFloat(discount);
        const parsedStock = parseInt(stock);
        const parsedPages = parseInt(pages);


    // Ensure required fields are provided
    if (!title || !author || !isbn || isNaN(parsedPrice) || isNaN(parsedStock)) {
      return res.status(400).json({ message: "Please provide all required fields correctly." });
    }

    // Check if a book with the same ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: "ISBN already exists. Please provide a unique ISBN." });
    }

    // Handle Image Upload (If file is uploaded)
    // let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;


    // Using Cloudinary, the image URL is stored in req.file.path
    let imageUrl = req.file ? req.file.path : null;
    

    const newBook = new Book({
        title,
        author,
        isbn,
        category,
        description,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice || null,
        discount: parsedDiscount || 0,
        stock: parsedStock,
        status,
        publisher,
        publishDate: publishDate ? new Date(publishDate) : null,
        language,
        pages: parsedPages || 0,
        image: imageUrl, // Save image URL
      });

    await newBook.save();

    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



// 🔹 Fetch All Books (Admin Only)
exports.getAllBooks = async (req, res) => {
    try {
      const books = await Book.find().sort({ createdAt: -1 }); // Sort by latest books
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };


  // 🔹 Fetch a Single Book by ID (Admin Only)
exports.getBookById = async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };



//   // 🔹 Update Book Details (Admin Only)
// exports.updateBook = async (req, res) => {
//     try {
//       const { title, author, isbn, category, description, price, originalPrice, discount, stock, status, publisher, publishDate, language, pages } = req.body;
  
//       let book = await Book.findById(req.params.id);
//       if (!book) {
//         return res.status(404).json({ message: "Book not found" });
//       }
  
//       // Convert strings to numbers
//       const parsedPrice = parseFloat(price);
//       const parsedOriginalPrice = parseFloat(originalPrice);
//       const parsedDiscount = parseFloat(discount);
//       const parsedStock = parseInt(stock);
//       const parsedPages = parseInt(pages);
  
//       // Handle Image Upload (If a new file is uploaded)
//       // if (req.file) {
//       //   book.image = `/uploads/${req.file.filename}`;
//       // }
  
//       book.image = req.file.path; // Cloudinary URL

//       // Update fields
//       book.title = title || book.title;
//       book.author = author || book.author;
//       book.isbn = isbn || book.isbn;
//       book.category = category || book.category;
//       book.description = description || book.description;
//       book.price = !isNaN(parsedPrice) ? parsedPrice : book.price;
//       book.originalPrice = !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : book.originalPrice;
//       book.discount = !isNaN(parsedDiscount) ? parsedDiscount : book.discount;
//       book.stock = !isNaN(parsedStock) ? parsedStock : book.stock;
//       book.status = status || book.status;
//       book.publisher = publisher || book.publisher;
//       book.publishDate = publishDate ? new Date(publishDate) : book.publishDate;
//       book.language = language || book.language;
//       book.pages = !isNaN(parsedPages) ? parsedPages : book.pages;
  
//       await book.save();
  
//       res.status(200).json({ message: "Book updated successfully", book });
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };

exports.updateBook = async (req, res) => {
  try {
    const { 
      title, author, isbn, category, description, 
      price, originalPrice, discount, stock, status, 
      publisher, publishDate, language, pages 
    } = req.body;

    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Convert strings to numbers (only if they are provided)
    const parsedPrice = price ? parseFloat(price) : NaN;
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : NaN;
    const parsedDiscount = discount ? parseFloat(discount) : NaN;
    const parsedStock = stock ? parseInt(stock) : NaN;
    const parsedPages = pages ? parseInt(pages) : NaN;

    // Only update the image if a new file is uploaded
    if (req.file) {
      book.image = req.file.path; // Cloudinary URL or uploaded file path
    }

    // Update text fields; if the new value is provided (even if empty string may be intentional),
    // you may want to further validate these values before assigning.
    if (typeof title !== 'undefined') book.title = title;
    if (typeof author !== 'undefined') book.author = author;
    if (typeof isbn !== 'undefined') book.isbn = isbn;
    if (typeof category !== 'undefined') book.category = category;
    if (typeof description !== 'undefined') book.description = description;

    // Update numeric fields with proper checks:
    if (!isNaN(parsedPrice)) {
      book.price = parsedPrice;
    }
    if (!isNaN(parsedOriginalPrice)) {
      book.originalPrice = parsedOriginalPrice;
    }
    if (!isNaN(parsedDiscount)) {
      book.discount = parsedDiscount;
    }
    if (!isNaN(parsedStock)) {
      book.stock = parsedStock;
    }
    if (!isNaN(parsedPages)) {
      book.pages = parsedPages;
    }

    if (typeof status !== 'undefined') book.status = status;
    if (typeof publisher !== 'undefined') book.publisher = publisher;
    if (publishDate) {
      // Ensure the publishDate is valid; if not, you could skip updating it or log a warning.
      const newPublishDate = new Date(publishDate);
      if (!isNaN(newPublishDate.getTime())) {
        book.publishDate = newPublishDate;
      } else {
        console.warn("Invalid publishDate provided:", publishDate);
      }
    }
    if (typeof language !== 'undefined') book.language = language;

    await book.save();

    res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};




  // 🔹 Delete a Book (Admin Only)
  exports.deleteBook = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the book
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      // Remove image file from `uploads/` if it exists
      if (book.image) {
        const imagePath = `.${book.image}`; // Convert to relative path
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the file
        }
      }
  
      // Delete the book from the database
      await Book.findByIdAndDelete(id);
  
      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
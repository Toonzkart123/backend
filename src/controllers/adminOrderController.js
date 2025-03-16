const Order = require("../models/orderModel");
const { format } = require("date-fns");
const fs = require("fs");
const path = require("path");
const fastCsv = require("fast-csv");


// 🔹 Fetch All Orders (For Admin)
exports.getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("user", "name email") // Fetch user details
        .populate("books.book", "title price") // Fetch book details
        .sort({ createdAt: -1 }); // Sort by latest orders first
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };


// 🔹 Update Order Status (For Admin)
exports.updateOrder = async (req, res) => {
    try {
      const { status, totalAmount, books } = req.body;
      const { id } = req.params;
  
      let order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // ✅ Update Order Status
      if (status) {
        const validStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status value" });
        }
        order.status = status;
      }
  
      // ✅ Update Total Amount
      if (totalAmount !== undefined) {
        if (isNaN(totalAmount) || totalAmount < 0) {
          return res.status(400).json({ message: "Total amount must be a valid number" });
        }
        order.totalAmount = totalAmount;
      }
  
      // ✅ Update Books in Order
      if (books) {
        if (!Array.isArray(books) || books.length === 0) {
          return res.status(400).json({ message: "Books must be a non-empty array" });
        }
        order.books = books;
      }
  
      // ✅ Save the updated order
      await order.save();
  
      res.status(200).json({ message: "Order updated successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

// // 🔹 Fetch a particular Order (For Admin)

//   exports.getOrderById = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       const order = await Order.findById(id)
//         .populate("user", "name email")  // Fetch user details
//         .populate("books.book", "title price"); // Fetch book details
  
//       if (!order) {
//         return res.status(404).json({ message: "Order not found" });
//       }
  
//       res.status(200).json(order);
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };


// 🔹 Fetch a particular Order (For Admin)
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "name email") // User details
      .populate("books.book", "title author price isbn"); // Book details with ISBN

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};



// // 🔹 Export Orders as CSV (Admin Only)
// exports.exportOrdersCSV = async (req, res) => {
//     try {
//       const orders = await Order.find()
//         .populate("user", "name email")
//         .populate("books.book", "title price")
//         .sort({ createdAt: -1 });
  
//       if (orders.length === 0) {
//         return res.status(400).json({ message: "No orders found to export." });
//       }
  
//       // Ensure the `exports/` directory exists
//       const exportsDir = path.join(__dirname, "../../exports");
//       if (!fs.existsSync(exportsDir)) {
//         fs.mkdirSync(exportsDir, { recursive: true });
//       }
  
//       // Define CSV file path
//       const csvFilePath = path.join(exportsDir, "orders.csv");
//       const writeStream = fs.createWriteStream(csvFilePath);
  
//       // Create CSV writer
//       const csvStream = fastCsv.format({ headers: true });
//       csvStream.pipe(writeStream);
  
//       // Write orders data
//       orders.forEach((order) => {
//         csvStream.write({
//           "Order ID": order._id,
//           "User Name": order.user ? order.user.name : "N/A",
//           "User Email": order.user ? order.user.email : "N/A",
//           "Book Titles": order.books.map((b) => (b.book ? b.book.title : "Unknown Book")).join(", "),
//           "Total Amount": order.totalAmount,
//           "Status": order.status,
//           "Created At": format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss"),
//         });
//       });
  
//       csvStream.end();
  
//       writeStream.on("finish", () => {
//         res.download(csvFilePath, "orders.csv", (err) => {
//           if (err) {
//             console.error("Error sending CSV file:", err);
//             res.status(500).json({ message: "Failed to export CSV" });
//           }
//         });
//       });
  
//     } catch (error) {
//       console.error("Error exporting CSV:", error);
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };

// 🔹 Export Orders as CSV (Admin Only)
exports.exportOrdersCSV = async (req, res) => {
    try {
      const orders = await Order.find()
        .populate({ path: "user", select: "name email" }) // ✅ Fetch user data properly
        .populate({ path: "books.book", model: "Book", select: "title price" }) // ✅ Ensure books are populated
        .sort({ createdAt: -1 });
  
      if (orders.length === 0) {
        return res.status(400).json({ message: "No orders found to export." });
      }
  
      // Ensure the `exports/` directory exists
      const exportsDir = path.join(__dirname, "../../exports");
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }
  
      // Define CSV file path
      const csvFilePath = path.join(exportsDir, "orders.csv");
      const writeStream = fs.createWriteStream(csvFilePath);
  
      // Create CSV writer
      const csvStream = fastCsv.format({ headers: true });
      csvStream.pipe(writeStream);
  
      // Write orders data
      orders.forEach((order) => {
        const bookTitles = order.books
          .map((b) => (b.book && b.book.title ? b.book.title : "No Title")) // ✅ Fix null book issue
          .join(", ");
  
        csvStream.write({
          "Order ID": order._id,
          "User Name": order.user && order.user.name ? order.user.name : "Unknown User",
          "User Email": order.user && order.user.email ? order.user.email : "Unknown Email",
          "Book Titles": bookTitles,
          "Total Amount": order.totalAmount,
          "Status": order.status,
          "Created At": format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss"),
        });
      });
  
      csvStream.end();
  
      writeStream.on("finish", () => {
        res.download(csvFilePath, "orders.csv", (err) => {
          if (err) {
            console.error("Error sending CSV file:", err);
            res.status(500).json({ message: "Failed to export CSV" });
          }
        });
      });
  
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };
  
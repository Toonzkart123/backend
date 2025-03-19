const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

// Import routes
const userRoutes = require("./src/routes/userRoutes");
const adminRoutes = require("./src/routes/adminRoutes"); 
const storeRoutes = require("./src/routes/storeRoutes");


const bookRoutes = require("./src/routes/bookRoutes");   
const cartRoutes = require("./src/routes/cartRoutes");   
const orderRoutes = require("./src/routes/orderRoutes"); 
const reviewRoutes = require("./src/routes/reviewRoutes");
const schoolRoutes = require("./src/routes/schoolRoutes");

const adminOrderRoutes = require("./src/routes/adminOrderRoutes");
const adminBookRoutes = require("./src/routes/adminBookRoutes");
const adminUserRoutes = require("./src/routes/adminUserRoutes");

const adminSchoolRoutes = require("./src/routes/adminSchoolRoutes"); 
const adminStoreRoutes = require("./src/routes/adminStoreRoutes");

const bookRequestRoutes = require("./src/routes/bookRequestRoutes");
const adminBookRequestRoutes = require("./src/routes/adminBookRequestRoutes");

const promoCodeRoutes = require('./src/routes/promoCodeRoutes');


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes); 
app.use("/api/stores", storeRoutes);
app.use("/api/schools", schoolRoutes);


app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/admin/orders", adminOrderRoutes);

app.use("/api/admin/books", adminBookRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/admin/users", adminUserRoutes);

app.use("/api/admin/schools", adminSchoolRoutes); 

app.use("/api/admin/stores", adminStoreRoutes);


app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/admin/book-requests", adminBookRequestRoutes);

app.use('/api/admin/promocodes', promoCodeRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to ToonzKart API!");
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

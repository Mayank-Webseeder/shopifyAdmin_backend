require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const homePageRoutes = require("./routes/homePageRoutes");
const pageRoutes = require("./routes/pageRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const dashboardRoutes = require("./routes/dashboardRoutes");



const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/homepage", homePageRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// https://api-shopify.webseeder.tech/api/products/webhook/product-update
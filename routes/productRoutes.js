const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Get all products
router.get("/", productController.getProducts);
router.get("/collections", productController.getShopifyCollections);
//Get Product By ID
router.get("/:id", productController.getProductById);

// Manual sync route
router.post("/sync", productController.fullSync);

// Shopify Webhook Routes
router.post("/webhook/product-update", productController.handleProductUpdate);
router.post("/webhook/product-delete", productController.handleProductDelete);

module.exports = router;

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Manual sync route
router.post("/sync", productController.fullSync);

// Shopify Webhook Routes
router.post("/webhook/product-update", productController.handleProductUpdate);
router.post("/webhook/product-delete", productController.handleProductDelete);

module.exports = router;

const express = require("express");
const { handleCustomerCreate } = require("../controllers/shopifyCustomerController.js");

const router = express.Router();

// Shopify customer create webhook
router.post("/webhook/create", handleCustomerCreate);

// You can add more later!
// router.post("/webhook/update", handleCustomerUpdate);

module.exports = router;

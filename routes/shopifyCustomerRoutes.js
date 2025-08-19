const express = require("express");
const { handleCustomerCreate, bulkSetPasswords, bulkFixInvitedCustomers } = require("../controllers/shopifyCustomerController.js");

const router = express.Router();

// Shopify customer create webhook
router.post("/webhook/create", handleCustomerCreate);
router.post("/bulk-set-passwords", bulkSetPasswords);
router.post("/bulk-fix-invited", bulkFixInvitedCustomers);

// You can add more later!
// router.post("/webhook/update", handleCustomerUpdate);

module.exports = router;

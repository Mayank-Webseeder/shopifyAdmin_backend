const express = require("express");
const {
    createOfferSection,
    getOfferSections,
    getOfferSectionById,
    updateOfferSection,
    deleteOfferSection,
} = require("../controllers/offerSectionController");

const upload = require("../config/multerConfig");

const router = express.Router();

router.post("/", upload.single("banner"), createOfferSection); // Create Offer Section
router.get("/", getOfferSections); // Get All Offer Sections
router.get("/:id", getOfferSectionById); // Get Single Offer Section
router.put("/:id", upload.single("banner"), updateOfferSection);
router.delete("/:id", deleteOfferSection); // Delete Offer Section

module.exports = router;

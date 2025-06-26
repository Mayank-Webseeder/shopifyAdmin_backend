const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const homePageController = require("../controllers/homePageController");

// Create a new home page section
router.post("/", upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "moreButtonImage", maxCount: 1 }
]), homePageController.createSection);

// Get all home page sections
router.get("/", homePageController.getSections);

// Get a single section by ID
router.get("/:id", homePageController.getSectionById);

// Delete a section
router.delete("/:id", homePageController.deleteSection);

// Update the position of a section
router.put("/reorder-sections", homePageController.updateSectionOrder);

// Update a section
router.put("/:id", upload.fields([
    { name: "bannerImage", maxCount: 1 },
    { name: "moreButtonImage", maxCount: 1 }
]), homePageController.updateSection);

module.exports = router;
const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const homePageController = require("../controllers/homePageController");

// Create a new home page section
router.post("/", upload.single("bannerImage"), homePageController.createSection);

// Get all home page sections
router.get("/", homePageController.getSections);

// Get a single section by ID
router.get("/:id", homePageController.getSectionById);


// Delete a section
router.delete("/:id", homePageController.deleteSection);

// Update the position of a section
router.put("/reorder-sections", homePageController.updateSectionOrder); // Unique route name

// Update a section
router.put("/:id", upload.single("bannerImage"), homePageController.updateSection);

module.exports = router;

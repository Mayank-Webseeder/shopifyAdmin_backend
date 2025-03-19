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

// Update a section
router.put("/:id", upload.single("bannerImage"), homePageController.updateSection);

// Delete a section
router.delete("/:id", homePageController.deleteSection);

module.exports = router;

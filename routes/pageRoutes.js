const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const pageController = require("../controllers/pageController");

// Create a page
router.post("/", upload.fields([{ name: "bannerImage" }, { name: "avatarImage" }]), pageController.createPage);

// Get all pages
router.get("/", pageController.getPages);

// Get a single page by ID
router.get("/:id", pageController.getPageById);

// Update a page
router.put("/:id", upload.fields([{ name: "bannerImage" }, { name: "avatarImage" }]), pageController.updatePage);

// Delete a page
router.delete("/:id", pageController.deletePage);

module.exports = router;

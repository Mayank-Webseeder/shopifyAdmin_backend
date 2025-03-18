const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const subcategoryController = require("../controllers/subcategoryController");

// Create a subcategory
router.post("/", upload.fields([{ name: "bannerImage" }, { name: "avatarImage" }]), subcategoryController.createSubcategory);

// Get all subcategories
router.get("/", subcategoryController.getSubcategories);

// Get a single subcategory by ID
router.get("/:id", subcategoryController.getSubcategoryById);

// Update a subcategory
router.put("/:id", upload.fields([{ name: "bannerImage" }, { name: "avatarImage" }]), subcategoryController.updateSubcategory);

// Delete a subcategory
router.delete("/:id", subcategoryController.deleteSubcategory);

module.exports = router;

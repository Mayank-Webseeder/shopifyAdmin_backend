const Subcategory = require("../models/Subcategory");
const deleteImage = require("../utils/deleteImage");

// Create a subcategory
const createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;
        const bannerImage = req.files["bannerImage"] ? `uploads/${req.files["bannerImage"][0].filename}` : null;
        const avatarImage = req.files["avatarImage"] ? `uploads/${req.files["avatarImage"][0].filename}` : null;

        const subcategory = new Subcategory({ name, category, bannerImage, avatarImage });
        await subcategory.save();

        res.status(201).json(subcategory);
    } catch (error) {
        res.status(500).json({ message: "Error creating subcategory", error });
    }
};

// Get all subcategories
const getSubcategories = async (req, res) => {
    try {
        const { category } = req.query; // Get category from query params

        let filter = {};
        if (category) {
            filter.category = category; // Filter by category if provided
        }

        const subcategories = await Subcategory.find(filter);
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error });
    }
};


// Get a single subcategory by ID
const getSubcategoryById = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });

        res.status(200).json(subcategory);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategory", error });
    }
};

// Update a subcategory
const updateSubcategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subcategory = await Subcategory.findById(id);
        if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });

        let updatedFields = req.body;
        if (req.files["bannerImage"]) {
            deleteImage(subcategory.bannerImage);
            updatedFields.bannerImage = `uploads/${req.files["bannerImage"][0].filename}`;
        }
        if (req.files["avatarImage"]) {
            deleteImage(subcategory.avatarImage);
            updatedFields.avatarImage = `uploads/${req.files["avatarImage"][0].filename}`;
        }

        const updatedSubcategory = await Subcategory.findByIdAndUpdate(id, updatedFields, { new: true });
        res.status(200).json(updatedSubcategory);
    } catch (error) {
        res.status(500).json({ message: "Error updating subcategory", error });
    }
};

// Delete a subcategory
const deleteSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) return res.status(404).json({ message: "Subcategory not found" });

        deleteImage(subcategory.bannerImage);
        deleteImage(subcategory.avatarImage);

        await Subcategory.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Subcategory deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting subcategory", error });
    }
};

module.exports = { createSubcategory, getSubcategories, getSubcategoryById, updateSubcategory, deleteSubcategory };

const OfferSection = require("../models/OfferSection");

// Create Offer Section
exports.createOfferSection = async (req, res) => {
    try {
        const { title } = req.body;
        const banner = req.file ? `uploads/${req.file.filename}` : null;
        const subcategories = JSON.parse(req.body.subcategories || "[]");
        const products = JSON.parse(req.body.products || "[]");

        if (!title || !banner) {
            return res.status(400).json({ error: "Title and banner are required." });
        }

        const newOfferSection = new OfferSection({
            title,
            banner,
            subcategories,
            products,
        });

        await newOfferSection.save();
        res.status(201).json({ message: "Offer Section created successfully", newOfferSection });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get All Offer Sections
exports.getOfferSections = async (req, res) => {
    try {
        const sections = await OfferSection.find()
            .populate("subcategories") // Fetch subcategory names
            .populate("products", "title images"); // Fetch product titles

        res.json(sections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Offer Section
exports.getOfferSectionById = async (req, res) => {
    try {
        const section = await OfferSection.findById(req.params.id)
            .populate("subcategories")
            .populate("products");

        if (!section) return res.status(404).json({ message: "Offer Section not found" });

        res.json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Offer Section
exports.updateOfferSection = async (req, res) => {
    try {
        console.log("Received update request:", req.body, req.file);

        const sectionId = req.params.id;
        const updateData = {}; // Start with an empty object

        if (req.body.title) {
            updateData.title = req.body.title;
        }

        if (req.file) {
            updateData.banner = req.file.path; // If a new banner is uploaded
        }

        if (req.body.subcategories) {
            try {
                updateData.subcategories = JSON.parse(req.body.subcategories);
            } catch (error) {
                return res.status(400).json({ error: "Invalid subcategories format" });
            }
        }

        if (req.body.products) {
            try {
                updateData.products = JSON.parse(req.body.products);
            } catch (error) {
                return res.status(400).json({ error: "Invalid products format" });
            }
        }

        console.log("Updating with data:", updateData); // Debugging log

        const updatedSection = await OfferSection.findByIdAndUpdate(
            sectionId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedSection) {
            return res.status(404).json({ error: "Offer Section not found" });
        }

        res.json(updatedSection);
    } catch (error) {
        console.error("Error updating offer section:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Offer Section
exports.deleteOfferSection = async (req, res) => {
    try {
        const deletedSection = await OfferSection.findByIdAndDelete(req.params.id);

        if (!deletedSection) return res.status(404).json({ message: "Offer Section not found" });

        res.json({ message: "Offer Section deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

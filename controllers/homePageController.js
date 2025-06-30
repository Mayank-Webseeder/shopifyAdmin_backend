const HomePageSection = require("../models/HomePageSection");
const deleteImage = require("../utils/deleteImage");
const mongoose = require("mongoose");

// Create a new section
const createSection = async (req, res) => {
    try {
        const {
            linkedPages = [],
            linkedProducts = [],
            bannerLinkType = "none",
            bannerLinkId,
            moreLinkType = "none",
            moreButtonText,
            moreLinkId,
            position = 0
        } = req.body;

        const bannerImage = req.files && req.files.bannerImage ? `uploads/${req.files.bannerImage[0].filename}` : null;
        const moreButtonImage = req.files && req.files.moreButtonImage ? `uploads/${req.files.moreButtonImage[0].filename}` : null;

        // Validate required bannerImage
        if (!bannerImage) {
            return res.status(400).json({ message: "Banner image is required" });
        }

        // Ensure only one of linkedPages or linkedProducts is provided
        if (linkedPages.length > 0 && linkedProducts.length > 0) {
            return res.status(400).json({ message: "Only one of linkedPages or linkedProducts can be selected." });
        }

        // Validate link types and IDs
        if (bannerLinkType !== "none" && !bannerLinkId) {
            return res.status(400).json({ message: "Banner link ID is required when banner link type is not 'none'" });
        }

        if (moreLinkType !== "none" && !moreLinkId) {
            return res.status(400).json({ message: "More link ID is required when more link type is not 'none'" });
        }

        const section = new HomePageSection({
            bannerImage,
            moreButtonImage,
            bannerLinkType,
            bannerLinkId,
            moreLinkType,
            moreLinkId,
            moreButtonText,
            linkedPages,
            linkedProducts,
            position
        });

        await section.save();
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ message: "Error creating section", error });
    }
};

// Get all sections
const getSections = async (req, res) => {
    try {
        const sections = await HomePageSection.find()
            .populate("linkedPages")
            .populate("linkedProducts")
            .sort({ position: 1 });

        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections", error });
    }
};

// Get a single section by ID
const getSectionById = async (req, res) => {
    try {
        const section = await HomePageSection.findById(req.params.id)
            .populate("linkedPages")
            .populate("linkedProducts");

        if (!section) return res.status(404).json({ message: "Section not found" });

        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ message: "Error fetching section", error });
    }
};

const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        let {
            linkedPages = [],
            linkedProducts = [],
            bannerLinkType,
            bannerLinkId,
            moreLinkType,
            moreLinkId,
            moreButtonText,
            position
        } = req.body;

        const section = await HomePageSection.findById(id);

        if (!section) return res.status(404).json({ message: "Section not found" });

        // If pages are sent, clear products. If products are sent, clear pages.
        if (linkedPages.length > 0) {
            linkedProducts = []; // Clear products if pages are being updated
        } else if (linkedProducts.length > 0) {
            linkedPages = []; // Clear pages if products are being updated
        }

        // Validate link types and IDs if provided
        if (bannerLinkType && bannerLinkType !== "none" && !bannerLinkId) {
            return res.status(400).json({ message: "Banner link ID is required when banner link type is not 'none'" });
        }

        if (moreLinkType && moreLinkType !== "none" && !moreLinkId) {
            return res.status(400).json({ message: "More link ID is required when more link type is not 'none'" });
        }

        let updatedFields = {
            linkedPages,
            linkedProducts
        };

        // Only update fields that are provided in the request
        if (bannerLinkType !== undefined) updatedFields.bannerLinkType = bannerLinkType;
        if (bannerLinkId !== undefined) updatedFields.bannerLinkId = bannerLinkId;
        if (moreLinkType !== undefined) updatedFields.moreLinkType = moreLinkType;
        if (moreLinkId !== undefined) updatedFields.moreLinkId = moreLinkId;
        if (position !== undefined) updatedFields.position = position;
        if (moreButtonText !== undefined) updatedFields.moreButtonText = moreButtonText;

        // Handle image updates
        if (req.files && req.files.bannerImage) {
            deleteImage(section.bannerImage);
            updatedFields.bannerImage = `uploads/${req.files.bannerImage[0].filename}`;
        }

        if (req.files && req.files.moreButtonImage) {
            if (section.moreButtonImage) {
                deleteImage(section.moreButtonImage);
            }
            updatedFields.moreButtonImage = `uploads/${req.files.moreButtonImage[0].filename}`;
        }

        const updatedSection = await HomePageSection.findByIdAndUpdate(id, updatedFields, { new: true })
            .populate("linkedPages")
            .populate("linkedProducts");

        res.status(200).json(updatedSection);
    } catch (error) {
        console.error("Error updating section:", error);
        res.status(500).json({ message: "Error updating section", error });
    }
};

// Delete a section
const deleteSection = async (req, res) => {
    try {
        const section = await HomePageSection.findById(req.params.id);
        if (!section) return res.status(404).json({ message: "Section not found" });

        // Delete both banner image and more button image if they exist
        deleteImage(section.bannerImage);
        if (section.moreButtonImage) {
            deleteImage(section.moreButtonImage);
        }

        await HomePageSection.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Section deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting section", error });
    }
};

const updateSectionOrder = async (req, res) => {
    try {
        const { orderedSections } = req.body;

        if (!Array.isArray(orderedSections) || orderedSections.length === 0) {
            return res.status(400).json({ message: "Invalid data format. Expecting an array of section IDs." });
        }

        console.log("Received orderedSections:", orderedSections); // Debugging

        // Validate ObjectId format before processing
        if (!orderedSections.every(id => mongoose.Types.ObjectId.isValid(id))) {
            return res.status(400).json({ message: "Invalid ObjectId detected in request." });
        }

        // Update each section's position in the database
        await Promise.all(
            orderedSections.map((id, index) =>
                HomePageSection.findByIdAndUpdate(id, { position: index })
            )
        );

        res.status(200).json({ message: "Section order updated successfully" });
    } catch (error) {
        console.error("Update section order error:", error);
        res.status(500).json({ message: "Error updating section order", error: error.message || error });
    }
};

module.exports = { createSection, getSections, getSectionById, updateSection, deleteSection, updateSectionOrder };
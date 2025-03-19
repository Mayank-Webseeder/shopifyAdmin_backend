const HomePageSection = require("../models/HomePageSection");
const deleteImage = require("../utils/deleteImage");

// Create a new section
const createSection = async (req, res) => {
    try {
        const { title, linkedPages } = req.body;
        const bannerImage = req.file ? `uploads/${req.file.filename}` : null;

        const section = new HomePageSection({ title, bannerImage, linkedPages });
        await section.save();

        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ message: "Error creating section", error });
    }
};

// Get all sections
const getSections = async (req, res) => {
    try {
        const sections = await HomePageSection.find().populate("linkedPages");
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sections", error });
    }
};

// Get a single section by ID
const getSectionById = async (req, res) => {
    try {
        const section = await HomePageSection.findById(req.params.id).populate("linkedPages");
        if (!section) return res.status(404).json({ message: "Section not found" });

        res.status(200).json(section);
    } catch (error) {
        res.status(500).json({ message: "Error fetching section", error });
    }
};

// Update a section
const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await HomePageSection.findById(id);
        if (!section) return res.status(404).json({ message: "Section not found" });

        let updatedFields = req.body;
        if (req.file) {
            deleteImage(section.bannerImage);
            updatedFields.bannerImage = `uploads/${req.file.filename}`;
        }

        const updatedSection = await HomePageSection.findByIdAndUpdate(id, updatedFields, { new: true }).populate("linkedPages");
        res.status(200).json(updatedSection);
    } catch (error) {
        res.status(500).json({ message: "Error updating section", error });
    }
};

// Delete a section
const deleteSection = async (req, res) => {
    try {
        const section = await HomePageSection.findById(req.params.id);
        if (!section) return res.status(404).json({ message: "Section not found" });

        deleteImage(section.bannerImage);
        await HomePageSection.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Section deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting section", error });
    }
};

module.exports = { createSection, getSections, getSectionById, updateSection, deleteSection };

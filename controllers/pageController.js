const Page = require("../models/Page");
const deleteImage = require("../utils/deleteImage");

// Create a page
const createPage = async (req, res) => {
    try {
        const { title, content, subcategory } = req.body;
        const linkedProducts = req.body.linkedProducts
            ? Array.isArray(req.body.linkedProducts)
                ? req.body.linkedProducts
                : [req.body.linkedProducts] // Ensure it's an array
            : [];

        const bannerImage = req.files["bannerImage"] ? `uploads/${req.files["bannerImage"][0].filename}` : null;
        const avatarImage = req.files["avatarImage"] ? `uploads/${req.files["avatarImage"][0].filename}` : null;

        const page = new Page({ title, content, subcategory, bannerImage, avatarImage, linkedProducts });
        await page.save();

        res.status(201).json(page);
    } catch (error) {
        res.status(500).json({ message: "Error creating page", error });
    }
};


// Get all pages with linked products
const getPages = async (req, res) => {
    try {
        const { subcategory } = req.query;
        let query = {};

        if (subcategory) {
            query.subcategory = subcategory; // Filter by subcategory if provided
        }

        const pages = await Page.find(query)
            .select("_id title avatarImage subcategory") // Select only the required fields
            .populate("subcategory"); // Populate subcategory data

        res.status(200).json(pages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pages", error });
    }
};


const getPagesForAdmin = async (req, res) => {
    try {
        const { subcategory } = req.query;
        let query = {};

        if (subcategory) {
            query.subcategory = subcategory; // Filter by subcategory if provided
        }

        const pages = await Page.find(query).populate("linkedProducts").populate("subcategory");
        res.status(200).json(pages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching pages", error });
    }
};


// Get a single page by ID with linked products
const getPageById = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id).populate("linkedProducts");
        if (!page) return res.status(404).json({ message: "Page not found" });

        res.status(200).json(page);
    } catch (error) {
        res.status(500).json({ message: "Error fetching page", error });
    }
};

const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { linkedProducts } = req.body;
        const page = await Page.findById(id);
        if (!page) return res.status(404).json({ message: "Page not found" });

        let updatedFields = { ...req.body };

        // Ensure linkedProducts is an array
        updatedFields.linkedProducts = [].concat(linkedProducts || []);

        // Handle image updates
        if (req.files["bannerImage"]) {
            deleteImage(page.bannerImage);
            updatedFields.bannerImage = `uploads/${req.files["bannerImage"][0].filename}`;
        }
        if (req.files["avatarImage"]) {
            deleteImage(page.avatarImage);
            updatedFields.avatarImage = `uploads/${req.files["avatarImage"][0].filename}`;
        }

        const updatedPage = await Page.findByIdAndUpdate(id, updatedFields, { new: true }).populate("linkedProducts");
        res.status(200).json(updatedPage);
    } catch (error) {
        console.error("Error updating page:", error);
        res.status(500).json({ message: "Error updating page", error });
    }
};


// Delete a page
const deletePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: "Page not found" });

        deleteImage(page.bannerImage);
        deleteImage(page.avatarImage);

        await Page.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Page deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting page", error });
    }
};

module.exports = { createPage, getPages, getPageById, updatePage, deletePage, getPagesForAdmin };

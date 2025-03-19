const mongoose = require("mongoose");

const HomePageSectionSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Section title
    bannerImage: { type: String, required: true }, // Banner image path
    linkedPages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }], // Array of linked Page IDs
});

module.exports = mongoose.model("HomePageSection", HomePageSectionSchema);

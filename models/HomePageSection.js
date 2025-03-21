const mongoose = require("mongoose");

const HomePageSectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    bannerImage: { type: String, required: true },
    linkedPages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
    linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    position: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model("HomePageSection", HomePageSectionSchema);

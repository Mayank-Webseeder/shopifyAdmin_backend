const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Subcategory", required: true },
    bannerImage: { type: String, required: true },
    avatarImage: { type: String, required: true },
});

module.exports = mongoose.model("Page", PageSchema);

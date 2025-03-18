const mongoose = require("mongoose");

const SubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ["Shop by Breed", "Shop by Disease"],
        required: true
    },
    bannerImage: { type: String, required: true }, // Stores file path
    avatarImage: { type: String, required: true }, // Stores file path
});

module.exports = mongoose.model("Subcategory", SubcategorySchema);

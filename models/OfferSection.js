const mongoose = require("mongoose");

const OfferSectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        banner: { type: String, required: true }, // Image URL
        subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }],
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("OfferSection", OfferSectionSchema);

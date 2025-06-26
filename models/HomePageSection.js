const mongoose = require("mongoose");


const HomePageSectionSchema = new mongoose.Schema({
    bannerImage: { type: String, required: true },
    moreButtonImage: { type: String }, // New field for more button image
    bannerLinkType: {
        type: String,
        enum: ["none", "subcategory", "collection"],
        default: "none"
    },
    bannerLinkId: { type: String }, // ID of linked subcategory or collection
    moreLinkType: {
        type: String,
        enum: ["none", "subcategory", "collection"],
        default: "none"
    },
    moreLinkId: { type: String }, // ID of linked subcategory or collection for more button
    linkedPages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],
    linkedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    position: { type: Number, required: true, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model("HomePageSection", HomePageSectionSchema);

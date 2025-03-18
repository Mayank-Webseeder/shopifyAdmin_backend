const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema({
    shopifyId: { type: Number, required: true, unique: true },
    title: String,
    price: String,
    sku: String,
    inventory_quantity: Number,
});

const ImageSchema = new mongoose.Schema({
    shopifyId: { type: Number, required: true },
    src: String,
});

const ProductSchema = new mongoose.Schema(
    {
        shopifyId: { type: Number, required: true, unique: true },
        title: { type: String, required: true },
        description: String,
        vendor: String,
        productType: String,
        createdAt: Date,
        updatedAt: Date,
        variants: [VariantSchema],
        images: [ImageSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);

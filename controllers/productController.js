const axios = require("axios");
const Product = require("../models/Product");
const WebhookLog = require("../models/WebhookLog");

const SHOPIFY_STORE = "goelvetpharma2.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_TOKEN;
const SHOPIFY_API_VERSION = "2024-01"; // Adjust if needed

exports.getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};

        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { "variants.sku": { $regex: search, $options: "i" } },
                    { vendor: { $regex: search, $options: "i" } },
                    { productType: { $regex: search, $options: "i" } },
                ],
            };
        }

        const products = await Product.find(filter);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ shopifyId: req.params.id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error });
    }
};

// Fetch all Shopify products
const fetchAllShopifyProducts = async () => {
    let products = [];
    let nextPageUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250`;

    try {
        while (nextPageUrl) {
            const response = await axios.get(nextPageUrl, {
                headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN },
            });

            products = [...products, ...response.data.products];

            // Check if there is a next page
            const linkHeader = response.headers.link;
            nextPageUrl = linkHeader && linkHeader.includes('rel="next"')
                ? linkHeader.split(";")[0].replace("<", "").replace(">", "").trim()
                : null;
        }

        return products;
    } catch (error) {
        console.error("Error fetching Shopify products:", error);
        return [];
    }
};

// Fetch all Shopify collections
exports.getShopifyCollections = async (req, res) => {
    try {
        let custom_collections = [];
        let nextPageUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/custom_collections.json`;

        while (nextPageUrl) {
            const response = await axios.get(nextPageUrl, {
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            });

            custom_collections = [...custom_collections, ...response.data.custom_collections];

            // Handle pagination
            const linkHeader = response.headers.link;
            nextPageUrl = linkHeader && linkHeader.includes('rel="next"')
                ? linkHeader.split(";")[0].replace("<", "").replace(">", "").trim()
                : null;
        }

        res.status(200).json(custom_collections);
    } catch (error) {
        console.error("Error fetching Shopify collections:", error.response?.data || error.message);
        res.status(500).json({
            message: "Error fetching Shopify collections",
            error: error.response?.data || error.message,
        });
    }
};

// Full Sync: Fetch all Shopify products and store/update in MongoDB
exports.fullSync = async (req, res) => {
    try {
        const products = await fetchAllShopifyProducts();
        const shopifyProductIds = products.map((p) => p.id); // Get all Shopify product IDs

        // Sync each product (create/update)
        for (const product of products) {
            await Product.findOneAndUpdate(
                { shopifyId: product.id },
                {
                    shopifyId: product.id,
                    title: product.title,
                    description: product.body_html,
                    vendor: product.vendor,
                    productType: product.product_type,
                    createdAt: product.created_at,
                    updatedAt: product.updated_at,
                    variants: product.variants.map((variant) => ({
                        shopifyId: variant.id,
                        title: variant.title,
                        price: variant.price,
                        sku: variant.sku,
                        inventory_quantity: variant.inventory_quantity,
                    })),
                    images: product.images.map((image) => ({
                        shopifyId: image.id,
                        src: image.src,
                    })),
                },
                { upsert: true, new: true }
            );
        }

        // Delete products from MongoDB that no longer exist in Shopify
        await Product.deleteMany({ shopifyId: { $nin: shopifyProductIds } });
        await WebhookLog.create({ message: "Full Sync Completed", syncType: "Full Sync" });
        res.json({ success: true, message: "Shopify products synced successfully" });
    } catch (error) {
        console.error("Full sync error:", error);
        res.status(500).json({ success: false, message: "Error syncing products" });
    }
};

// Webhook: Handle Product Created/Updated
exports.handleProductUpdate = async (req, res) => {
    try {
        const product = req.body;

        await Product.findOneAndUpdate(
            { shopifyId: product.id },
            {
                shopifyId: product.id,
                title: product.title,
                description: product.body_html,
                vendor: product.vendor,
                productType: product.product_type,
                createdAt: product.created_at,
                updatedAt: product.updated_at,
                variants: product.variants.map((variant) => ({
                    shopifyId: variant.id,
                    title: variant.title,
                    price: variant.price,
                    sku: variant.sku,
                    inventory_quantity: variant.inventory_quantity,
                })),
                images: product.images.map((image) => ({
                    shopifyId: image.id,
                    src: image.src,
                })),
            },
            { upsert: true, new: true }
        );

        await WebhookLog.create({ message: `Product updated: ${product.title}`, syncType: "Product Update" });
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error("Webhook update error:", error);
        res.status(500).json({ success: false, message: "Error updating product" });
    }
};

// Webhook: Handle Product Deleted
exports.handleProductDelete = async (req, res) => {
    try {
        const { id } = req.body; // Shopify sends the deleted product ID

        // Find and delete the product
        const deletedProduct = await Product.findOneAndDelete({ shopifyId: id });

        // Log webhook event
        await WebhookLog.create({
            message: `Product deleted: ${deletedProduct ? deletedProduct.title : 'Unknown'}`,
            syncType: "Product Delete"
        });

        res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Webhook delete error:", error);
        res.status(500).json({ success: false, message: "Error deleting product" });
    }
};


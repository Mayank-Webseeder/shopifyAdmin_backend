const Product = require("../models/Product");
const Subcategory = require("../models/Subcategory");
const Page = require("../models/Page");
const WebhookLog = require("../models/WebhookLog");

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Count stats
        const totalSubcategories = await Subcategory.countDocuments();
        const totalBreeds = await Subcategory.countDocuments({ category: "Shop by Breed" });
        const totalPages = await Page.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Get last sync timestamp (latest entry in WebhookLog)
        const lastSyncEntry = await WebhookLog.findOne().sort({ createdAt: -1 });
        const lastSync = lastSyncEntry ? lastSyncEntry.createdAt : "Never Synced";

        // Get recent webhook logs (last 10)
        const recentWebhooks = await WebhookLog.find().sort({ createdAt: -1 }).limit(10);

        // Get names of recently updated products (last 5)
        const recentlyUpdatedProducts = await Product.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .select("title updatedAt");

        // Get low-stock products (inventory < 10)
        // const lowStockProducts = await Product.find({ "variants.inventory_quantity": { $lt: 10 } })
        //     .select("title variants.inventory_quantity")
        //     .limit(5);

        res.json({
            totalSubcategories,
            totalBreeds,
            totalPages,
            totalProducts,
            lastSync,
            recentWebhooks: recentWebhooks.map(log => ({
                message: log.message,
                syncType: log.syncType,
                timestamp: log.createdAt
            })),
            recentlyUpdatedProducts: recentlyUpdatedProducts.map(p => ({
                title: p.title,
                updatedAt: p.updatedAt
            })),
            // lowStockProducts: lowStockProducts.map(p => ({
            //     title: p.title,
            //     stock: p.variants.map(v => v.inventory_quantity).join(", ")
            // }))
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ success: false, message: "Error fetching dashboard stats" });
    }
};

const mongoose = require("mongoose");

const WebhookLogSchema = new mongoose.Schema({
    message: { type: String, required: true },
    syncType: { type: String, enum: ["Product Update", "Product Delete", "Full Sync"], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WebhookLog", WebhookLogSchema);

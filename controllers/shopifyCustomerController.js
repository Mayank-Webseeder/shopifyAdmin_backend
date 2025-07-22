const axios = require("axios");

// Shopify config variables
const SHOPIFY_STORE = "goelvetpharma2.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_TOKEN;
const SHOPIFY_API_VERSION = "2024-01";

// Handle customers/create webhook
exports.handleCustomerCreate = async (req, res) => {
    const customer = req.body;

    console.log("📩 Incoming Shopify webhook payload:", JSON.stringify(customer, null, 2));

    // Basic validation
    if (!customer || !customer.id) {
        console.error("❌ Invalid payload: Missing 'customer' object or 'id'.");
        return res.status(400).json({ success: false, message: "Invalid payload: 'customer.id' is required." });
    }

    const customerId = customer.id;

    const staticPassword = "Shopify@2024Secure!";
    const updateUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}.json`;

    try {
        const response = await axios.put(
            updateUrl,
            {
                customer: {
                    id: customerId,
                    password: staticPassword,
                    password_confirmation: staticPassword,
                },
            },
            {
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`✅ Password set for customer ${customerId}`);
        res.status(200).json({ success: true, message: "Password set successfully", data: response.data });
    } catch (error) {
        console.error(`❌ Failed to set password for customer ${customerId}:`, error?.response?.data || error);
        res.status(500).json({ success: false, message: "Failed to set password", error: error?.response?.data || error });
    }
};

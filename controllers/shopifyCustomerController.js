const axios = require("axios");

// Shopify config variables
const SHOPIFY_STORE = "goelvetpharma2.myshopify.com";
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_TOKEN;
const SHOPIFY_API_VERSION = "2024-01";
const staticPassword = "Shopify@2024Secure!";

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
    const getUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}.json`;

    try {
        // Step 1: Set password
        await axios.put(
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

        // Step 2: Fetch customer again to check state
        const getResponse = await axios.get(getUrl, {
            headers: {
                "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
        });

        const currentState = getResponse.data.customer.state;
        console.log(`🔍 Customer ${customerId} current state after password set: ${currentState}`);

        // Step 3: If still invited, reapply password
        if (currentState === "invited") {
            console.log(`⚠️ Customer ${customerId} still in invited state, reapplying password...`);
            await axios.put(
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

            console.log(`✅ Invited state patched → Password re-applied for customer ${customerId}`);

            // Optional: fetch again to confirm final state
            const confirmResponse = await axios.get(getUrl, {
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
                    "Content-Type": "application/json",
                },
            });
            console.log(`🔄 Final state for customer ${customerId}: ${confirmResponse.data.customer.state}`);
        }

        res.status(200).json({ success: true, message: "Password set and state checked" });
    } catch (error) {
        console.error(`❌ Failed for customer ${customerId}:`, error?.response?.data || error.message || error);
        res.status(500).json({ success: false, message: "Failed to process customer", error: error?.response?.data || error.message || error });
    }
};

exports.bulkSetPasswords = async (req, res) => {
    console.log("🚀 BULK PASSWORD ENDPOINT HIT!");

    // Respond immediately so Postman/ThunderClient can close
    res.status(200).json({ message: "✅ Bulk password update started in background." });

    console.log("🔍 Starting background job...");

    const CONCURRENCY = 2; // ✅ Safe for Shopify REST
    const staticPassword = "Shopify@2024Secure!";
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let updatedCount = 0;

    const parseLinkHeader = (linkHeader) => {
        if (!linkHeader) return null;

        const links = linkHeader.split(",");
        for (const link of links) {
            const [urlPart, relPart] = link.split(";");
            if (relPart && relPart.includes('rel="next"')) {
                return urlPart.trim().slice(1, -1); // Remove < >
            }
        }
        return null;
    };

    const fetchAllCustomers = async () => {
        console.log("🟢 Fetching all customers...");
        let customers = [];
        let nextPageUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250`;

        while (nextPageUrl) {
            console.log(`➡️  GET ${nextPageUrl}`);
            const response = await axios.get(nextPageUrl, {
                headers: { "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN },
            });

            customers = [...customers, ...response.data.customers];

            const linkHeader = response.headers.link;
            nextPageUrl = parseLinkHeader(linkHeader);

            // Log progress
            console.log(`📄 Customers fetched so far: ${customers.length}`);
        }

        console.log(`✅ All customers fetched. Total: ${customers.length}`);
        return customers;
    };

    const updateCustomerPassword = async (customerId) => {
        console.log(`🔑 Updating customer ${customerId}`);
        const updateUrl = `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}.json`;

        try {
            await axios.put(
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
            updatedCount++;
            console.log(`✅ Password set for customer ${customerId} | Total updated: ${updatedCount}`);
        } catch (error) {
            console.error(`❌ Failed for customer ${customerId}:`, error?.response?.data || error.message);
        }
    };

    try {
        const customers = await fetchAllCustomers();
        console.log(`🚦 Looping through ${customers.length} customers with concurrency ${CONCURRENCY}...`);

        for (let i = 0; i < customers.length; i += CONCURRENCY) {
            const batch = customers.slice(i, i + CONCURRENCY);
            await Promise.all(batch.map((customer) => updateCustomerPassword(customer.id)));
            await sleep(1000); // ✅ Respect Shopify REST rate limit
        }

        console.log(`🎉 Bulk password update DONE. Total updated: ${updatedCount}`);
    } catch (err) {
        console.error("❌ JOB FAILED:", err?.response?.data || err);
    }
};


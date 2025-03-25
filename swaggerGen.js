const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "SHOPIFY PANEL API",
        description: "Auto-generated API documentation",
        version: "1.0.0",
    },
    host: "api-shopify.webseeder.tech", // Ensure this matches your backend port
    schemes: ["https"], // Change to ["https"] in production
    tags: [
        { name: "Auth", description: "User authentication routes" },
        { name: "Products", description: "Product-related operations" },
        { name: "Subcategories", description: "Subcategory management" },
        { name: "Home Page", description: "Homepage management" },
        { name: "Pages", description: "Page content management" },
    ],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./server.js"]; // Scan `server.js` to detect all routes

swaggerAutogen(outputFile, endpointsFiles, doc).then(({ data }) => {
    console.log("✅ Swagger JSON generated!");

    const fs = require("fs");

    // ✅ Fix issue where `/api/api/` appears by NOT adding `/api/` if it's already there
    const updatedPaths = {};
    Object.keys(data.paths).forEach((route) => {
        if (route.startsWith("/api/")) {
            updatedPaths[route] = data.paths[route]; // Keep original if already has `/api/`
        } else {
            updatedPaths[`/api${route}`] = data.paths[route]; // Add `/api/` only if missing
        }
    });

    // ✅ Ensure correct categories (tags) for all routes
    Object.keys(updatedPaths).forEach((route) => {
        const pathObj = updatedPaths[route];

        Object.keys(pathObj).forEach((method) => {
            if (route.includes("/api/auth")) {
                pathObj[method].tags = ["Auth"];
            } else if (route.includes("/api/products")) {
                pathObj[method].tags = ["Products"];
            } else if (route.includes("/api/subcategories")) {
                pathObj[method].tags = ["Subcategories"];
            } else if (route.includes("/api/homepage")) {
                pathObj[method].tags = ["Home Page"];
            } else if (route.includes("/api/pages")) {
                pathObj[method].tags = ["Pages"];
            }
        });
    });

    data.paths = updatedPaths;

    // ✅ Save the corrected swagger.json
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
    console.log("✅ Swagger documentation updated with correct API prefixes & categories!");
});

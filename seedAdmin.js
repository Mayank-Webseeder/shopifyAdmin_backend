const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config(); // Load environment variables

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (existingAdmin) {
            console.log("Admin user already exists.");
        } else {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            await User.create({
                fullname: "Admin User",
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
            });
            console.log("Admin user created successfully.");
        }

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding admin user:", error);
        mongoose.connection.close();
    }
};

seedAdmin();

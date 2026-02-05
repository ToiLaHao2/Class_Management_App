const path = require('path');

// 1. load bien moi truong
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 2. import module tu core
const { connectFirebase } = require('../../../libs/core/database/src/index');
const { seedSuperAdmin } = require('../../../libs/core/database/src/seed');
const { uploadMiddleware } = require('../../../libs/core/storage/src/index');

const app = express();
const PORT = process.env.PORT || 3000;

// === MIDDLEWARES ===
app.use(helmet());
app.use(cors());
app.use(express.json());

// === kiem tra ket noi ===
console.log("\n--- 🛠️  SYSTEM CHECK ---");

// Test 1: ket noi firebase
const { db, admin } = connectFirebase();
if (db) {
    console.log("✅ [Firebase]   Database connected & Ready.");
    seedSuperAdmin(db, admin);
} else {
    console.error("❌ [Firebase]   Connection FAILED. Check .env!");
}

// Test 2: ket noi cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log(`✅ [Cloudinary] Configured for cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
    console.error("❌ [Cloudinary] Missing configuration in .env");
}
console.log("----------------------\n");


// === ROUTER ===

// api health check
app.get('/', (req, res) => {
    res.json({
        service: 'CMA Backend Gateway',
        status: 'active',
        timestamp: new Date()
    });
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`🚀 Gateway is running at: http://localhost:${PORT}`);
});


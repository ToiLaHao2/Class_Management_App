const dbManager = require('../../database/src/index');
const { seedSuperAdmin } = require('../../database/src/seed');
const storageManager = require('../../storage/src/index');
const cacheManager = require('../../cache/src/index');

const runSystemCheck = async () => {
    console.log("\n--- 🛠️  SYSTEM CHECK ---");

    const { db, admin } = dbManager.connect();
    if (db) {
        console.log("✅ [Firebase] Database connected & Ready.");
        await seedSuperAdmin(db, admin);
    } else {
        console.error("❌ [Firebase] Connection FAILED. Check .env!");
    }

    const uploadMiddleware = storageManager.getUploadMiddleware();
    if (uploadMiddleware) {
        console.log(`✅ [Cloudinary] Storage middleware ready.`);
    } else {
        console.error("❌ [Cloudinary] Storage middleware NOT initialized.");
    }

    if (cacheManager.connect()) {
        console.log("✅ [Cache] Cache connected & Ready!");
    } else {
        console.error("❌ [Cache] Connection FAILED. Check .env!");
    }

    console.log("----------------------\n");
};

module.exports = runSystemCheck;

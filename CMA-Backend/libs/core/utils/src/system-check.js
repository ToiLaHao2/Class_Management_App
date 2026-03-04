const { firebase } = require('@core/database');
const { seedSuperAdmin } = require('@core/database/src/seed');
const storageManager = require('@core/storage');
const cacheManager = require('@core/cache');

const runSystemCheck = async () => {
    console.log("\n--- 🛠️  SYSTEM CHECK ---");

    // Firebase
    const { db, admin } = firebase.connect();
    if (db) {
        console.log("✅ [Firebase] Database connected & Ready.");
        await seedSuperAdmin(db, admin);
    } else {
        console.error("❌ [Firebase] Connection FAILED. Check .env!");
    }

    // Cloudinary
    const uploadMiddleware = storageManager.getUploadMiddleware();
    if (uploadMiddleware) {
        console.log(`✅ [Cloudinary] Storage middleware ready.`);
    } else {
        console.error("❌ [Cloudinary] Storage middleware NOT initialized.");
    }

    // Cache (Redis) — optional, khong crash neu chua co Redis
    try {
        const connected = cacheManager.connect();
        if (connected) {
            console.log("✅ [Cache] Cache connected & Ready!");
        } else {
            console.warn("⚠️  [Cache] Connection returned falsy. Check .env!");
        }
    } catch (err) {
        console.warn("⚠️  [Cache] Redis not available:", err.message);
    }

    console.log("----------------------\n");
};

module.exports = runSystemCheck;

const admin = require('firebase-admin');

// khoi tao
let db = null;
let auth = null;

const connectFirebase = () => {
    // 1. Neu co ket noi thi tra lai
    if (db && auth) {
        return { db, auth, admin };
    }

    try {
        console.log("🔄 Connecting to Firebase...");

        // 2. lay key tu file .env
        const serviceAccountStr = process.env.FIREBASE_CREDENTIALS;

        if (!serviceAccountStr) {
            throw new Error("❌ MISSING FIREBASE_CREDENTIALS IN .ENV");
        }

        // 3. parse chuoi json
        let serviceAccount;
        try {
            serviceAccount = JSON.parse(serviceAccountStr);
        } catch (e) {
            throw new Error("❌ FIREBASE_CREDENTIALS JSON IS INVALID");
        }

        // 4. khoi tao app
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                // storageBucket: "your-project.appspot.com" // (Bật cái này sau khi làm tính năng upload file)
            });
            console.log("✅ Firebase Connected Successfully!");
        }

        // 5. khoi tao cac dich vu
        db = admin.firestore();
        auth = admin.auth();

        return { db, auth, admin };

    } catch (error) {
        console.error("🔥 Firebase Connection Failed:", error.message);
        return { db: null, auth: null, admin: null };
    }
};

module.exports = { connectFirebase, admin };
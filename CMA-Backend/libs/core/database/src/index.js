// core ket noi database, sau nay neu can thay doi thi lam o day
const admin = require('firebase-admin');
const databaseConfig = require('../../config/src/configs/database.config');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.auth = null;
        this.admin = null;
    }

    /**
     * Khoi tao ket noi den Firebase/Firestore
     * @returns {Object} { db, auth, admin }
     */
    connect() {
        // 1. Neu da ket noi thi tra lai instance da co
        if (this.db && this.auth) {
            return { db: this.db, auth: this.auth, admin: this.admin };
        }

        try {
            console.log("🔄 Connecting to Firebase...");

            // 2. Lay credentials tu env
            // Uu tien lay tu bien moi truong FIREBASE_CREDENTIALS (dang JSON string)
            const serviceAccountStr = databaseConfig.firebaseCredentials;

            if (!serviceAccountStr) {
                // Fallback: Check xem co dung Application Default Credentials (GCP) khong
                // Neu muon strict thi throw Error luon
                throw new Error("❌ MISSING FIREBASE_CREDENTIALS IN .ENV");
            }

            // 3. Parse JSON credentials
            let serviceAccount;
            try {
                serviceAccount = JSON.parse(serviceAccountStr);
            } catch (e) {
                throw new Error("❌ FIREBASE_CREDENTIALS JSON IS INVALID");
            }

            // 4. Khoi tao App (chong duplicate init)
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                console.log("✅ Firebase Connected Successfully!");
            }

            // 5. Luu instance vao class property
            this.admin = admin;
            this.db = admin.firestore();
            this.auth = admin.auth();

            return { db: this.db, auth: this.auth, admin: this.admin };

        } catch (error) {
            console.error("🔥 Firebase Connection Failed:", error);
            // Trong Singleton, neu init that bai thi nen danh dau la null de lan sau retry
            this.db = null;
            this.auth = null;
            this.admin = null;

            // Tra ve null object de caller tu xu ly
            return { db: null, auth: null, admin: null };
        }
    }

    /**
     * Getter cho DB Instance (Short-hand)
     */
    getDB() {
        if (!this.db) return this.connect().db;
        return this.db;
    }

    /**
     * Getter cho Auth Instance (Short-hand)
     */
    getAuth() {
        if (!this.auth) return this.connect().auth;
        return this.auth;
    }
}

// Singleton Export: Tao mot instance duy nhat va export no
const databaseManager = new DatabaseManager();
module.exports = databaseManager;
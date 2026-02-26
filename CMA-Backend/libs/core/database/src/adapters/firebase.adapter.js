const admin = require('firebase-admin');
const BaseAdapter = require('./base.adapter');
const databaseConfig = require('../../../config/src/configs/database.config');

class FirebaseAdapter extends BaseAdapter {
    constructor() {
        super();
        this.db = null;
        this.auth = null;
        this.admin = null;
    }

    /**
     * @override
     * Khoi tao ket noi den Firebase/Firestore
     * @returns {{ db, auth, admin }}
     */
    connect() {
        // 1. Neu da ket noi thi tra lai instance da co (Singleton)
        if (this._connected) {
            return { db: this.db, auth: this.auth, admin: this.admin };
        }

        try {
            console.log('🔄 Connecting to Firebase...');

            // 2. Lay credentials tu env (FIREBASE_CREDENTIALS dang JSON string)
            const serviceAccountStr = databaseConfig.firebaseCredentials;
            if (!serviceAccountStr) {
                throw new Error('❌ MISSING FIREBASE_CREDENTIALS IN .ENV');
            }

            // 3. Parse JSON credentials
            let serviceAccount;
            try {
                serviceAccount = JSON.parse(serviceAccountStr);
            } catch (e) {
                throw new Error('❌ FIREBASE_CREDENTIALS JSON IS INVALID');
            }

            // 4. Khoi tao App (chong duplicate init)
            if (!admin.apps.length) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
            }

            // 5. Luu instance va danh dau da connected
            this.admin = admin;
            this.db = admin.firestore();
            this.auth = admin.auth();
            this._connected = true;

            console.log('✅ Firebase Connected Successfully!');
            return { db: this.db, auth: this.auth, admin: this.admin };

        } catch (error) {
            console.error('🔥 Firebase Connection Failed:', error);
            this.db = null;
            this.auth = null;
            this.admin = null;
            this._connected = false;
            return { db: null, auth: null, admin: null };
        }
    }

    /**
     * @override
     * Tra ve Firestore instance (tu dong connect neu chua ket noi)
     * @returns {FirebaseFirestore.Firestore}
     */
    getDB() {
        if (!this._connected) this.connect();
        return this.db;
    }

    /**
     * Tra ve Auth instance (Firebase-specific, ngoai contract chung)
     * @returns {admin.auth.Auth}
     */
    getAuth() {
        if (!this._connected) this.connect();
        return this.auth;
    }

    /**
     * @override
     * Xoa toan bo ket noi Firebase
     */
    async disconnect() {
        if (!this._connected) return;
        await admin.app().delete();
        this.db = null;
        this.auth = null;
        this.admin = null;
        this._connected = false;
        console.log('🔌 Firebase Disconnected.');
    }
}

// Singleton Export
const firebaseAdapter = new FirebaseAdapter();
module.exports = firebaseAdapter;
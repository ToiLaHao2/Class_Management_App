const SEED_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SEED_ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD;

const seedSuperAdmin = async (db, admin) => {
    try {
        console.log('🌱 Checking system for Super Admin...');

        // 1. kiem tra thong tin admin da co trong database chua
        const snapshot = await db.collection('users').where('role', '==', 'admin').limit(1).get();

        if (!snapshot.empty) {
            console.log('✅ Super Admin already exists. Skipping seed.');
            return;
        }

        console.log('⚠️ No Admin found. Creating default Super Admin...');

        // 2. tao user ben Auth (Firebase Auth)
        let userRecord;
        try {
            // tim user ben Auth
            userRecord = await admin.auth().getUserByEmail(SEED_ADMIN_EMAIL);
        } catch (e) {
            // neu chua co thi tao moi
            userRecord = await admin.auth().createUser({
                email: SEED_ADMIN_EMAIL,
                password: SEED_ADMIN_PASSWORD,
                displayName: 'System Administrator',
                emailVerified: true
            });
        }

        // 3. tao user ben database (Firestore)
        const adminData = {
            email: SEED_ADMIN_EMAIL,
            displayName: 'System Administrator',
            role: 'admin',
            mustChangePassword: true, // bat buoc doi pass
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // ghi de vao document voi ID trung voi UID cua Auth
        await db.collection('users').doc(userRecord.uid).set(adminData);

        console.log(`🎉 Super Admin created successfully!`);
        console.log(`👉 Email: ${SEED_ADMIN_EMAIL}`);
        console.log(`👉 Password: ${SEED_ADMIN_PASSWORD}`);
        console.log(`⚠️ Please login and change password immediately!`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
};

module.exports = { seedSuperAdmin };
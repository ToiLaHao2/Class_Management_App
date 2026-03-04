const { NotFoundError } = require('@core/exceptions');

/**
 * Base Repository cho Firestore (Firebase).
 * Các Module như Users, Courses, v.v sẽ kế thừa từ class này 
 * để tái sử dụng các hàm Create, Read, Update, Delete chuẩn.
 */
class BaseFirebaseRepository {
    /**
     * @param {import('firebase-admin/firestore').Firestore} firestore - Instance Firestore
     * @param {string} collectionName - Ten collection tren Database (VD: 'users')
     */
    constructor(firestore, collectionName) {
        if (!firestore) throw new Error('Firestore instance is required');
        this.db = firestore;
        this.collectionName = collectionName;
        this.collection = this.db.collection(collectionName);
    }

    /**
     * Tim mot document theo ID
     */
    async findById(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Tim mot document theo ID hoac nem loi NotFoundError
     */
    async findByIdOrThrow(id) {
        const data = await this.findById(id);
        if (!data) {
            throw new NotFoundError(`Document with id '${id}' not found in ${this.collectionName}`);
        }
        return data;
    }

    /**
     * Tao moi 1 document (Tu dong tao ID hoac truyen ID)
     * @param {Object} data 
     * @param {string?} id - Neu khong truyen, Firestore tu generate 
     */
    async create(data, id = null) {
        const docRef = id ? this.collection.doc(id) : this.collection.doc();

        const timestamp = new Date();
        const payload = {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await docRef.set(payload);
        return { id: docRef.id, ...payload };
    }

    /**
     * Cap nhat (merge) document hien tai
     */
    async update(id, partialData) {
        const docRef = this.collection.doc(id);

        // Kiem tra ton tai truoc khi update
        await this.findByIdOrThrow(id);

        const payload = {
            ...partialData,
            updatedAt: new Date()
        };

        await docRef.set(payload, { merge: true });
        return { id, ...(await this.findById(id)) }; // Tra ve ban moi nhat
    }

    /**
     * Xoa document hoan toan khoi database
     */
    async delete(id) {
        await this.findByIdOrThrow(id);
        await this.collection.doc(id).delete();
        return true;
    }
}

module.exports = BaseFirebaseRepository;

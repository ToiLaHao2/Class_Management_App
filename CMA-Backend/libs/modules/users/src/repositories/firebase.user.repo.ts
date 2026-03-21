import { BaseFirebaseRepository, IDatabaseAdapter } from '@core/database';
import { IUsersRepository, IUserEntity } from '../user.model';

export class FirebaseUsersRepository implements IUsersRepository {
    private baseRepo: BaseFirebaseRepository;
    private collection: FirebaseFirestore.CollectionReference;

    constructor({ db }: { db: IDatabaseAdapter }) {
        const firestore = db.getDB() as FirebaseFirestore.Firestore;
        if (!firestore) {
            throw new Error('Firestore is not initialized');
        }

        this.baseRepo = new BaseFirebaseRepository(firestore, 'users');
        this.collection = firestore.collection('users');
    }

    async findById(id: string): Promise<IUserEntity | null> {
        const doc = await this.baseRepo.findById(id);
        if (!doc) return null;
        return doc as unknown as IUserEntity;
    }

    async findAll(): Promise<IUserEntity[]> {
        const snapshot = await this.collection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as IUserEntity));
    }

    async findByEmail(email: string): Promise<IUserEntity | null> {
        const snapshot = await this.collection.where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as unknown as IUserEntity;
    }

    async create(data: Omit<IUserEntity, 'id' | 'createdAt' | 'isDeleted'>): Promise<IUserEntity> {
        const payload = { ...data, isDeleted: false };
        const doc = await this.baseRepo.create(payload);
        return doc as unknown as IUserEntity;
    }

    async update(id: string, partialData: Partial<IUserEntity>): Promise<IUserEntity> {
        const doc = await this.baseRepo.update(id, partialData as unknown as Record<string, unknown>);
        return doc as unknown as IUserEntity;
    }
}

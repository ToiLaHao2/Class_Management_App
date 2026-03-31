export type { IDatabaseAdapter } from './src/adapters/base.adapter';

// Firebase (kept for reference, currently inactive in DI)
export { firebaseAdapter } from './src/adapters/firebase.adapter';
export { BaseFirebaseRepository } from './src/repositories/base-firebase.repository';
export { seedSuperAdmin } from './src/seed';

// PostgreSQL (active)
export { postgresAdapter } from './src/adapters/postgres.adapter';
export { BasePostgresRepository } from './src/repositories/base-postgres.repository';
export { seedSuperAdminPostgres } from './src/seed-postgres';

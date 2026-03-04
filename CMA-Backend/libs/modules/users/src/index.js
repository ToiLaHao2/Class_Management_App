const { AppModule } = require('@core/shared');

/**
 * UsersModule — Quan ly nguoi dung trong he thong.
 *
 * Day la vi du implement AppModule contract.
 * Moi module khac (courses, auth, ...) se co cau truc tuong tu.
 */
class UsersModule extends AppModule {
    get name() { return 'users'; }
    get basePath() { return '/users'; }

    /**
     * @override
     * Dang ky tat ca route cua users module vao Express app.
     * @param {import('express').Application} app
     * @param {{ db, cache, eventBus }} deps
     */
    register(app, { db, cache, eventBus }) {
        const express = require('express');
        const router = express.Router();

        // TODO: Gan cac route thuc su cua users o day
        // Vi du:
        // router.get('/', (req, res) => res.json({ message: 'list users' }));
        // router.get('/:id', getUserById);

        // Placeholder de kiem tra module da duoc load thanh cong
        router.get('/health', (req, res) => {
            res.json({ module: this.name, status: 'ok' });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath}`);
    }
}

// Singleton export — api-gateway se require() file nay truc tiep
module.exports = new UsersModule();

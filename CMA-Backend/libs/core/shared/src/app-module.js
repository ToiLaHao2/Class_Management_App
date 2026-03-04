/**
 * AppModule — Abstract base class (contract) cho tat ca business modules.
 *
 * Moi module (users, courses, auth, ...) PHAI extends class nay
 * va implement cac getter/method duoi day.
 *
 * Muc dich:
 *   - api-gateway chi can biet ve AppModule, khong biet chi tiet tung module
 *   - Them module moi chi can them vao danh sach, khong sua api-gateway
 *   - De dang doi framework (Express → Fastify/Nest/...) chi can sua phan register()
 */
class AppModule {
    constructor() {
        if (new.target === AppModule) {
            throw new Error('AppModule is abstract and cannot be instantiated directly.');
        }
    }

    /**
     * Ten dinh danh cua module. Dung cho logging va debug.
     * Vi du: 'users', 'courses', 'auth'
     * @returns {string}
     */
    get name() {
        throw new Error(`${this.constructor.name} must implement get name()`);
    }

    /**
     * Route goc cua module. Tat ca route trong module se nam duoi day.
     * Vi du: '/users' → /users/profile, /users/:id, ...
     * @returns {string}
     */
    get basePath() {
        throw new Error(`${this.constructor.name} must implement get basePath()`);
    }

    /**
     * Dang ky module vao Express app: gan router, middleware, ...
     * Duoc goi 1 lan duy nhat khi api-gateway khoi dong.
     *
     * @param {import('express').Application} app - Express instance
     * @param {Object} deps - Shared dependencies duoc inject tu api-gateway
     * @param {import('@core/database').firebase} deps.db   - Firestore instance
     * @param {import('@core/cache')} deps.cache             - Cache instance
     * @param {import('@core/shared/event-bus')} deps.eventBus - EventBus instance
     */
    register(app, deps) {
        throw new Error(`${this.constructor.name} must implement register(app, deps)`);
    }
}

module.exports = AppModule;

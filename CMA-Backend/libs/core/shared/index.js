const AppModule = require('./src/app-module');
const { loadModules } = require('./src/module-loader');
const BaseEventBus = require('./src/base-event-bus');
const eventBus = require('./src/in-memory-event-bus');
const validateRequest = require('./src/middlewares/validate-request');
const { requireAuth, requireRole } = require('./src/middlewares/auth-guard');

module.exports = {
    AppModule,
    loadModules,
    BaseEventBus,
    eventBus,
    validateRequest,
    requireAuth,
    requireRole
};

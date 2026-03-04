const AppModule = require('./src/app-module');
const { loadModules } = require('./src/module-loader');
const BaseEventBus = require('./src/base-event-bus');
const eventBus = require('./src/in-memory-event-bus');

module.exports = { AppModule, loadModules, BaseEventBus, eventBus };

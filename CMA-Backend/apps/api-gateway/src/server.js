const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { appConfig } = require('@core/config');
const { runSystemCheck } = require('@core/utils/src/index');
const { loadModules, eventBus } = require('@core/shared');
const { globalErrorHandler, NotFoundError } = require('@core/exceptions');

// === APP SETUP ===
const app = express();
const PORT = appConfig.port;

// === MIDDLEWARES ===
app.use(helmet());
app.use(cors());
app.use(express.json());

// === SYSTEM CHECK ===
runSystemCheck();

// === GATEWAY HEALTH CHECK ===
app.get('/', (req, res) => {
    res.json({
        service: 'CMA Backend Gateway',
        status: 'active',
        timestamp: new Date()
    });
});

// === LOAD ALL MODULES (auto-discovery) ===
// Khi them module moi, chi can tao src/index.js export AppModule instance
// Khong can sua file nay
const deps = {
    eventBus,
    // db:       require('@core/database').firebase.getDB(),
    // cache:    require('@core/cache'),
};
loadModules(app, deps);

// === 404 NOT FOUND HANDLER ===
// Neu request den mot URL ma chua module nao dang ky
app.all('*', (req, res, next) => {
    next(new NotFoundError(`Can't find ${req.method} ${req.originalUrl} on this server!`));
});

// === GLOBAL ERROR HANDLER ===
// Phai dat o cuoi cung, duoi tat ca cac routes
app.use(globalErrorHandler);

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`🚀 Gateway is running at: http://localhost:${PORT}`);
});

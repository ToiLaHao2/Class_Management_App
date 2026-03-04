const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const appConfig = require('@core/config/src/configs/app.config');
const { runSystemCheck } = require('@core/utils/src/index');
const { loadModules, eventBus } = require('@core/shared');

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

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`🚀 Gateway is running at: http://localhost:${PORT}`);
});

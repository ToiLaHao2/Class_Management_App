const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');


const appConfig = require('../../../libs/core/config/src/configs/app.config');
const { runSystemCheck } = require('../../../libs/core/utils/src/index');

// === MIDDLEWARES ===

const app = express();
const PORT = appConfig.port;

app.use(helmet());
app.use(cors());
app.use(express.json());

// === SYSTEM CHECK ===
runSystemCheck();


// === ROUTER ===

// api health check
app.get('/', (req, res) => {
    res.json({
        service: 'CMA Backend Gateway',
        status: 'active',
        timestamp: new Date()
    });
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`🚀 Gateway is running at: http://localhost:${PORT}`);
});


import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { appConfig } from '@core/config';
import { runSystemCheck } from '@core/utils';
import { loadModules, eventBus } from '@core/shared';
import { globalErrorHandler, NotFoundError } from '@core/exceptions';

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
app.get('/', (_req: Request, res: Response) => {
    res.json({
        service: 'CMA Backend Gateway',
        status: 'active',
        timestamp: new Date()
    });
});

import { container } from '@core/container';

// === LOAD ALL MODULES (auto-discovery) ===
loadModules(app, container);

// === 404 NOT FOUND HANDLER ===
app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Can't find ${req.method} ${req.originalUrl} on this server!`));
});

// === GLOBAL ERROR HANDLER ===
app.use(globalErrorHandler);

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`🚀 Gateway is running at: http://localhost:${PORT}`);
});

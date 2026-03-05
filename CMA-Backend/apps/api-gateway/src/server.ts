import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import { appConfig, rateLimitConfig } from '@core/config';
import { runSystemCheck } from '@core/utils';
import { loadModules } from '@core/shared';
import { globalErrorHandler, NotFoundError } from '@core/exceptions';
import { container } from '@core/container';
import { RegisterRoutes } from './generated/routes';
import swaggerDocument from './generated/swagger.json';

// === APP SETUP ===
const app = express();
const PORT = appConfig.port;

// === MIDDLEWARES ===
app.use(helmet());
app.use(cors());
app.use(express.json());

// === RATE LIMITING ===
// Global: max requests per window across all routes
const globalLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    standardHeaders: true,   // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
// Auth: stricter limit to prevent brute-force
const authLimiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.authMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, please wait before trying again.' },
});
app.use(globalLimiter);
app.use('/auth', authLimiter);

// === SYSTEM CHECK ===
runSystemCheck();

// === GATEWAY HEALTH CHECK ===
app.get('/', (_req: Request, res: Response) => {
    res.json({
        service: 'CMA Backend Gateway',
        status: 'active',
        timestamp: new Date(),
        docs: `http://localhost:${PORT}/docs`,
    });
});

// === SWAGGER UI ===
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === TSOA GENERATED ROUTES ===
RegisterRoutes(app);

// === LOAD LEGACY MODULES (auto-discovery for non-tsoa modules) ===
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
    console.log(`📖 Swagger UI   at: http://localhost:${PORT}/docs`);
});

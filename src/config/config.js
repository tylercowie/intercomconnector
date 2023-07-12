import {createRequire} from 'node:module';
import {env} from './env.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export const config = {
    port: env.PORT,
    version: pkg.version,
    logLevel: env.LOG_LEVEL,
    mode: env.NODE_ENV,
    clientId: env.ENV_OAUTH_CLIENT_ID,
    clientSecret: env.ENV_OAUTH_CLIENT_SECRET,
    mongoDsn: env.ENV_MONGO_DSN,
    mongoDbName: env.ENV_MONGO_DB_NAME,
    Redis: {
        useSentinel: env.ENV_USE_SENTINEL,
        sentinel: {
            host: env.ENV_SENTINEL_HOST,
            port: env.ENV_SENTINEL_PORT,
            name: env.ENV_SENTINEL_NAME,
        },
        redis: {
            keyPrefix: env.ENV_REDIS_PREFIX,
            host: env.ENV_REDIS_HOST,
            password: env.ENV_REDIS_PASSWORD,
            port: env.ENV_REDIS_PORT,
            db: env.ENV_REDIS_DB,
        },
    },
};

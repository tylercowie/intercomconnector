import {config} from 'dotenv';
import envalid from 'envalid';

config();
const {num, str, bool} = envalid;

export const env = envalid.cleanEnv(process.env, {
    PORT: num({default: 3700}),
    LOG_LEVEL: str({default: 'info'}),
    NODE_ENV: str({
        default: 'development',
        choices: ['development', 'test', 'production'],
    }),

    ENV_HOST: str({default: '127.0.0.1:3700'}),

    ENV_OAUTH_CLIENT_ID: str({devDefault: ''}),
    ENV_OAUTH_CLIENT_SECRET: str({devDefault: ''}),

    ENV_USE_SENTINEL: bool({default: false}),
    ENV_SENTINEL_HOST: str({default: 'sentinel'}),
    ENV_SENTINEL_PORT: num({default: 26379}),
    ENV_SENTINEL_NAME: str({default: 'mymaster'}),
    ENV_REDIS_PREFIX: str({default: 'intercom:'}),
    ENV_REDIS_HOST: str({default: 'redis'}),
    ENV_REDIS_PASSWORD: str({default: ''}),
    ENV_REDIS_PORT: num({default: 6379}),
    ENV_REDIS_DB: num({default: 0}),

    ENV_MONGO_DSN: str({
        devDefault: 'mongodb://mongo:27017/',
    }),
    ENV_MONGO_DB_NAME: str({
        default: 'intercom',
    }),

    MAX_CONCURRENT_WEBHOOKS: num({default: 40}),
});

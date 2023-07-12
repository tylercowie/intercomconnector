import {randomUUID} from 'crypto';
import {createApp} from '../src/app.js';
import {config} from '../src/config/config.js';
import {createRedisClient} from '../src/cache/redisClient.js';
import {createCache} from '../src/cache/cache.js';
import {createMongoClient} from '../src/models/mongoClient.js';

export const createTestApp = ({clientId, clientSecret} = {}) => {
    const redisClient = createRedisClient(config.Redis);
    const cache = createCache({redisClient});
    const mongoClient = createMongoClient(
        `mongodb://mongo:27017/`,
        `intercomapp-test-${randomUUID()}`,
    );
    const server = createApp({
        cache,
        clientId,
        clientSecret,
        mongoClient,
    }).listen();
    const {port} = server.address();
    const url = `http://127.0.0.1:${port}`;

    return {
        async flushCache() {
            await cache.flush();
        },
        async destroy() {
            await new Promise((resolve) => {
                server.close(resolve);
            });
        },
        url,
        mongoClient,
    };
};

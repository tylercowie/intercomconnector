import Redis from 'ioredis';
import {log} from '../log.js';

const createSentinelClient = (config) => {
    log.info(`connecting to sentinel`);
    return new Redis({
        sentinels: [{host: config.sentinel.host, port: config.sentinel.port}],
        name: config.sentinel.name,
        keyPrefix: config.redis.keyPrefix,
        password: config.redis.password,
        db: config.redis.db,
    });
};

const createPureRedisClient = ({redis}) => {
    log.info(`connecting to pure redis`);
    return new Redis({
        keyPrefix: redis.keyPrefix,
        host: redis.host,
        port: redis.port,
        password: redis.password,
        db: redis.db,
    });
};

export const createRedisClient = (config) => {
    const client = config.useSentinel
        ? createSentinelClient(config)
        : createPureRedisClient(config);
    Object.defineProperty(client, `connected`, {
        get() {
            return client.status === `ready`;
        },
    });

    client.on(`error`, (err) => {
        log.info(`redis error`, err);
    });

    client.on(`connect`, () => {
        log.info(`redis is connected`);
    });

    return client;
};

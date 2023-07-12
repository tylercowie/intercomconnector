import {createApp} from './app.js';
import {config} from './config/config.js';
import {log} from './log.js';
import {createRedisClient} from './cache/redisClient.js';
import {createCache} from './cache/cache.js';
import {createMongoClient} from './models/mongoClient.js';

const redisClient = createRedisClient(config.Redis);
const mongoClient = createMongoClient(config.mongoDsn, config.mongoDbName);

const createShutdownCallback = (signal, logLevel = `info`, exitCode = 0) => {
    return (error) => {
        log.log(logLevel, `Application exit by reason ${error}`);
        log.info(`stop app due to ${signal}`);

        if (redisClient.connected) {
            redisClient.quit((err) => {
                if (err) {
                    log.error(`unable to disconnect from redis`, err);
                } else {
                    log.info(`disconnected from redis`);
                }
            });
        }

        try {
            mongoClient.disconnect();
        } catch (err) {
            log.error(`unable to disconnect from mongo`, err);
        }

        // eslint-disable-next-line n/no-process-exit
        process.exit(exitCode);
    };
};

const cache = createCache({redisClient});
const app = createApp({
    cache,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    mongoClient,
});

app.listen(config.port);
log.info(`Server is started on port ${config.port}`);

process.on(`SIGTERM`, createShutdownCallback(`SIGTERM`));
process.on(`SIGINT`, createShutdownCallback(`SIGINT`));
process.on(
    `uncaughtException`,
    createShutdownCallback(`uncaughtException`, `error`, 1),
);
process.on(
    `unhandledRejection`,
    createShutdownCallback(`unhandledRejection`, `error`, 1),
);

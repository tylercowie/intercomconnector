import fns from 'date-fns';
import {config} from '../config/config.js';
import {log} from '../log.js';

const startDate = new Date();

const getMbSize = (n) => `${Math.round(n / 1024 / 1024)} Mb`;

const checkConnection = async ({hasConnection, timeout, logTimeout}) => {
    const timer = setTimeout(logTimeout, timeout);

    try {
        await hasConnection();
    } finally {
        clearTimeout(timer);
    }
};

export const getStatus = async ({mongoClient}) => {
    const memoryUsage = process.memoryUsage();

    try {
        await mongoClient.connect();
        await checkConnection({
            hasConnection: mongoClient.checkConnection,
            timeout: 500,
            logTimeout: () =>
                log.error(`Mongo health check took more than 500ms`),
        });
    } catch (err) {
        log.error(`Mongo status check failed`);
        throw err;
    }

    return {
        id: process.pid,
        up: fns.formatDistanceStrict(startDate, new Date()),
        version: config.version,
        memory: {
            rss: getMbSize(memoryUsage.rss),
            heapUsed: getMbSize(memoryUsage.heapUsed),
            heapTotal: getMbSize(memoryUsage.heapTotal),
        },
    };
};

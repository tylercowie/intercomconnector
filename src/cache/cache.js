import {log} from '../log.js';

export const createCache = ({redisClient}) => {
    const set = async (key, value, ttlms) => {
        if (!redisClient.connected) {
            log.warn(`skipped setting because redis connection is missing`);
            return;
        }

        await redisClient.set(key, value, `EX`, ttlms);
    };

    const get = async (key) => {
        if (!redisClient.connected) {
            log.warn(`skipped getting because redis connection is missing`);
            return null;
        }
        return redisClient.get(key);
    };

    const setJson = async (key, value, ttlms) => {
        await set(key, JSON.stringify(value), ttlms);
    };

    const getJson = async (key) => {
        const value = await get(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (err) {
                log.error(`unable to parse found data`, err);
                return null;
            }
        }

        return null;
    };

    const promiseMap = new Map();

    const ensureValue = (key, resolver, expirationPeriod) => {
        const promiseMapValue = promiseMap.get(key);
        if (promiseMapValue) {
            return promiseMapValue;
        }

        const promise = getJson(key)
            .then((cached) => {
                if (cached) {
                    return cached;
                }

                return resolver().then((value) => {
                    setJson(key, value, expirationPeriod);
                    return value;
                });
            })
            .finally(() => {
                promiseMap.delete(key);
            });

        promiseMap.set(key, promise);
        return promise;
    };

    const handleError =
        (fn, logMessage, returnValue) =>
        async (...args) => {
            try {
                return await fn(...args);
            } catch (err) {
                log.error(logMessage, err);
                return returnValue;
            }
        };

    return {
        set: handleError(set, `unable to set`),
        get: handleError(get, `unable to get`, null),
        setJson: handleError(setJson, `unable to set object`),
        getJson: handleError(getJson, `unable to get object`, null),
        ensureValue,
        flush: () => {
            if (redisClient.connected) redisClient.flushdb();
        },
    };
};

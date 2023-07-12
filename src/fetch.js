import got from 'got';
import {correlateGot} from './correlationId.js';
import {log} from './log.js';
import {getErrorMessage} from './transformError.js';

const logRequestError = (err) => {
    const {response, options, code} = err;

    const errCode = response ? response.statusCode : code;

    log.error(
        `[beforeError]: [${options.method}] ${options.url} failed with code ${errCode}`,
    );

    return err;
};

const logRequest = (options) => {
    log.debug(`[beforeRequest]: [${options.method}] ${options.url}`);
};

const logRetry = (err, retryCount) => {
    log.warn(`[beforeRetry]: ${getErrorMessage(err)}`);
    log.warn(
        `[beforeRetry]: ${retryCount} retry for [${err.options.method}] ${err.options.url}`,
    );
};

const logResponse = (response) => {
    log.debug(
        `[afterResponse]: ${response.statusCode} [${response.request.options.method}] ${response.request.options.url}`,
        {
            durationMs: response.timings.phases.total,
        },
    );
    return response;
};

const gotErrorHandling = got.extend({
    hooks: {
        beforeError: [logRequestError],
        beforeRequest: [logRequest],
        beforeRetry: [logRetry],
        afterResponse: [logResponse],
    },
});

export const fetch = correlateGot(gotErrorHandling);

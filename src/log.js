import vzdrpLogger from '@fibery/vizydrop-logger';
import {correlator} from './correlationId.js';
import {config} from './config/config.js';

export const log = vzdrpLogger.createLogger({
    correlationId: {
        enabled: true,
        getCorrelationId: correlator.getId,
        emptyValue: `nocorrelation`,
    },
    mode: config.mode,
    level: config.logLevel,
});

export const requestLogMw = vzdrpLogger.createKoaRequestLogMiddleware({
    logger: log,
});

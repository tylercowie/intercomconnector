import correlationId from '@fibery/correlation-id';

export const {
    correlator,
    koaMiddleware: correlationMw,
    enhanceGot: correlateGot,
} = correlationId.createCorrelationId();

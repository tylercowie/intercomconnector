import {env} from '../../config/env.js';
import {correlator} from '../../correlationId.js';
import {fetch} from '../../fetch.js';
import {log} from '../../log.js';
import {getHandlersByTopic} from './getHandlersByTopic.js';
import pLimit from 'p-limit';
import {getErrorMessage} from '../../transformError.js';

const limit = pLimit(env.MAX_CONCURRENT_WEBHOOKS);

const processWebhook = ({url, headers, body}) => {
    const parentCorrelationId = correlator.getId();

    return correlator.withIdAndReturn(correlator.generateId(), async () => {
        log.info(
            `send webhook event. Parent correlationId: ${parentCorrelationId}`,
            {
                parentCorrelationId,
            },
        );

        try {
            await fetch(url, {
                headers: {
                    'x-hub-signature': headers['x-hub-signature'],
                },
                method: `POST`,
                json: body,
            });
        } catch (err) {
            log.error(
                `[handleIncomingMessage]: failed to process notification for [${
                    body.app_id
                }][${body.topic}]: ${getErrorMessage(err)}`,
                {
                    parentCorrelationId,
                },
            );
        }
    });
};

export const handleIncomingMessage =
    ({webhooksCollection}) =>
    async (body, headers) => {
        const handlers = getHandlersByTopic(body.topic);
        const types = Object.keys(handlers);

        const cursor = await webhooksCollection.find({
            appId: body.app_id,
            types: {$in: types},
        });
        const webhooks = await cursor.toArray();

        log.info(
            `Webhooks to update: [${webhooks.length}] for topic:[${body.topic}] app:[${body.app_id}]`,
        );

        for (const {url} of webhooks) {
            limit(processWebhook, {url, headers, body});
        }

        setTimeout(() => {
            // need to skip tick to have correct activeCount
            if (limit.activeCount >= env.MAX_CONCURRENT_WEBHOOKS - 10) {
                log.warn(
                    `[handleIncomingMessage]: queue active: ${limit.activeCount}, pending: ${limit.pendingCount}`,
                );
            }
        }, 0);

        return {processed: true};
    };

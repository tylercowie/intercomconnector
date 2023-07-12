import {getEventHandler} from './getEventHandler.js';
import {getHandlersByTopic} from './getHandlersByTopic.js';

export const transformWebhookPayload = ({schemaProvider}) => async ({
    payload: {
        topic,
        data: {item},
    },
    account,
    types,
}) => {
    const eventHandler = getEventHandler({schemaProvider, account});
    const handlers = getHandlersByTopic(topic);

    let data = {};

    await Promise.all(
        Object.entries(handlers).map(async ([type, handler]) => {
            if (types.includes(type)) {
                data[type] = await handler({eventHandler, item});
            }
        }),
    );

    return {data};
};

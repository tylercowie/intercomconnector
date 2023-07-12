import {verifyWebhook} from './verifyWebhook.js';
import {deleteWebhook} from './deleteWebhook.js';
import {setupWebhook} from './setupWebhook.js';
import {transformWebhookPayload} from './transformWebhookPayload.js';
import {handleIncomingMessage} from './handleIncomingMessage.js';
import {createWebhooksCollection} from '../../models/webhooksCollection.js';

export const createWebhooksProvider = ({
    clientSecret,
    schemaProvider,
    mongoClient,
}) => {
    const webhooksCollection = createWebhooksCollection(mongoClient);

    return {
        setupWebhook: setupWebhook({webhooksCollection}),
        deleteWebhook: deleteWebhook({webhooksCollection}),
        verifyWebhook: verifyWebhook({clientSecret}),
        transformWebhookPayload: transformWebhookPayload({schemaProvider}),
        handleIncomingMessage: handleIncomingMessage({
            webhooksCollection,
        }),
    };
};

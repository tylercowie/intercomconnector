import _ from 'lodash';
import {badRequest} from '../../errors.js';
import {log} from '../../log.js';
import {AuthTypes} from '../config/types.js';

const transformWebhook = ({webhook, appId}) => ({
    /*
        we provide appId as webhook id
        to be able to define what hooks to call on incoming notifications
    */
    id: appId,
    hookId: String(webhook._id),
    types: webhook.types,
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt,
});

const isSameTypes = (typesA, typesB) => {
    if (typesA.length !== typesB.length) {
        return false;
    }

    const diff = _.difference(typesA, typesB);
    return diff.length === 0;
};

export const setupWebhook = ({webhooksCollection}) => async ({
    account: {auth, intercomAppId: appId},
    webhook,
    types,
    url,
}) => {
    if (auth !== AuthTypes.oauth2.id) {
        throw badRequest('Webhooks are available only for OAuth accounts');
    }

    if (!webhook) {
        log.info(
            `Registering webhook: app-[${appId}] types-[${types.join()}] url-[${url}]`,
        );
        const createdWebhook = await webhooksCollection.insertOne({
            url,
            types,
            appId: appId,
        });

        return transformWebhook({webhook: createdWebhook, appId});
    }

    if (!isSameTypes(types, webhook.types)) {
        log.info(
            `Updating webhook: app-[${appId}] types-[${types.join()}] url-[${url}]`,
        );
        const updatedWebhook = await webhooksCollection.setById(
            webhook.hookId,
            {
                url,
                types,
                appId: appId,
            },
        );

        return transformWebhook({webhook: updatedWebhook, appId});
    }

    return webhook;
};

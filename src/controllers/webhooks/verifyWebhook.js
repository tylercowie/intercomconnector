import crypto from 'crypto';
import {badRequest} from '../../errors.js';

export const verifySignature = ({rawBody, secret, signature}) => {
    const calculatedSignature = `sha1=${crypto
        .createHmac('sha1', secret)
        .update(rawBody)
        .digest('hex')}`;

    if (calculatedSignature !== signature) {
        throw badRequest(`Invalid signature provided`);
    }
};

export const verifyWebhook =
    () =>
    async ({payload}) => {
        // already verified in handleIncomingMessage
        return {id: payload.app_id};
    };

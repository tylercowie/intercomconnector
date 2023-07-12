import {fetchConversation} from '../../connector/api.js';
import {expiringImgRegex} from './fetchConversationImage.js';
import {env} from '../../config/env.js';

const buildUrl = ({id, partId, accountId}) => {
    const protocol = env.isProd ? 'https' : 'http';

    return partId
        ? `${protocol}://${env.ENV_HOST}/api/v1/conversation/${id}/${partId}/img?accountId=${accountId}`
        : `${protocol}://${env.ENV_HOST}/api/v1/conversation/${id}/img?accountId=${accountId}`;
};

const replaceImgs = ({id, partId, body, accountId}) =>
    body.replace(expiringImgRegex, `"${buildUrl({id, partId, accountId})}"`);

const getUrlAttachments = ({id, partId, attachments}) =>
    attachments.map(({url}) => {
        const pathname = new URL(url).pathname;
        const searchParams = new URLSearchParams({
            id,
            pathname,
        });

        if (partId) searchParams.append('partId', partId);

        return `app://resource?${searchParams.toString()}`;
    });

const buildConversationPart = ({author, body}, {id, partId, accountId}) =>
    `<p><b>${author.name || 'Unknown'}:</b></p>${replaceImgs({
        id,
        partId,
        body,
        accountId,
    })}`;

export const fetchDetailedConversation = async ({id, account}) => {
    const {body: detailed} = await fetchConversation({
        token: account.token,
        id,
    });

    const messages = detailed.source.body
        ? [
              buildConversationPart(detailed.source, {
                  id: detailed.id,
                  accountId: account.accountId,
              }),
          ]
        : [];

    let files = getUrlAttachments({
        id,
        attachments: detailed.source.attachments,
    });

    detailed.conversation_parts.conversation_parts.forEach((part) => {
        if (part.body) {
            messages.push(
                buildConversationPart(part, {
                    id: detailed.id,
                    partId: part.id,
                    accountId: account.accountId,
                }),
            );
        }

        files = files.concat(
            getUrlAttachments({
                id,
                partId: part.id,
                attachments: part.attachments,
            }),
        );
    });

    return {
        ...detailed,
        source: {
            ...detailed.source,
            body: messages,
        },
        files,
    };
};

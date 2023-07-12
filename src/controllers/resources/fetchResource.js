import {fetchConversation} from '../../connector/api.js';
import {notFound, badRequest} from '../../errors.js';
import {fetch} from '../../fetch.js';

export const fetchResource = async ({account, params}) => {
    if (!params.id || !params.pathname) {
        throw badRequest(`Either id or pathname of file is missing`);
    }

    const {body: conversation} = await fetchConversation({
        token: account.token,
        id: params.id,
    });

    const {attachments} = params.partId
        ? conversation.conversation_parts.conversation_parts.find(
              (part) => part.id === params.partId,
          ) || {}
        : conversation.source;

    const {url} =
        attachments.find(
            ({url}) => new URL(url).pathname === params.pathname,
        ) || {};

    if (!url)
        throw notFound(
            `Attachment with pathname: ${params.pathname} for conversation: ${params.id} was not found`,
        );

    return fetch.stream(url);
};

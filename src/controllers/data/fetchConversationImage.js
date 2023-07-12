import {fetchConversation} from '../../connector/api.js';
import {notFound} from '../../errors.js';
import {fetch} from '../../fetch.js';
import {createAccountsCollection} from '../../models/accountsCollection.js';

export const expiringImgRegex =
    /"(https:\/\/downloads\.intercomcdn\.com.+\?expires=.+)"/;

export const fetchConversationImage = async (
    {mongoClient},
    {id, partId, accountId},
) => {
    const accountsCollection = createAccountsCollection(mongoClient);

    const account = await accountsCollection.findById(accountId);

    if (!account) throw notFound(`Account not found`);

    const {body: conversation} = await fetchConversation({
        token: account.token,
        id: id,
    });

    const {body} = partId
        ? conversation.conversation_parts.conversation_parts.find(
              (part) => part.id === partId,
          ) || {}
        : conversation.source;

    const [, imgUrl] = expiringImgRegex.exec(body) || [];

    if (!imgUrl) throw notFound('No images found in conversation body');

    return fetch.stream(imgUrl);
};

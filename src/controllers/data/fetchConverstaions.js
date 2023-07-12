import {searchConversations} from '../../connector/api.js';
import {log} from '../../log.js';
import {Filters} from '../config/types.js';
import {buildSearchQuery} from './buildSearchQuery.js';
import {getMaxTimestamp} from './dateConverters.js';
import {fetchDetailedConversation} from './fetchDetailedConversation.js';

const getDetailedConversations = (conversations, {account}) =>
    conversations.map((conversation) =>
        fetchDetailedConversation({id: conversation.id, account}),
    );

export const fetchConversations = async ({
    account,
    filter,
    pagination,
    lastSynchronizedAt,
}) => {
    const timer = log.startTimer();

    const {
        body: {conversations, pages},
    } = await searchConversations({
        token: account.token,
        startingAfter: pagination.starting_after,
        query: buildSearchQuery([
            {
                filter: Filters.updated_at,
                value: getMaxTimestamp(lastSynchronizedAt, filter.updated_at),
            },
        ]),
    });

    const conversationWithChat = await Promise.all(
        getDetailedConversations(conversations, {
            account,
        }),
    );

    timer.done(
        `Fetched conversations: page - ${pages.page} total_pages - ${pages.total_pages}`,
    );

    return {
        items: conversationWithChat,
        pagination: {
            hasNext: Boolean(pages.next),
            nextPageConfig: pages.next,
        },
        synchronizationType: lastSynchronizedAt ? 'delta' : 'full',
    };
};

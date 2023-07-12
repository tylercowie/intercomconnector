import {log} from '../../log.js';
import {Types} from '../config/types.js';

export const getHandlersByTopic = (topic) => {
    switch (topic) {
        case 'conversation.user.created':
        case 'conversation.user.replied':
        case 'conversation.admin.replied':
        case 'conversation.admin.single.created':
            return {
                [Types.conversations.id]: ({eventHandler, item}) =>
                    eventHandler.getConversationDelta({
                        id: item.id,
                    }),
            };
        case 'conversation.admin.closed':
        case 'conversation.admin.opened':
        case 'conversation.admin.snoozed':
        case 'conversation.admin.unsnoozed':
            return {
                [Types.conversations.id]: ({eventHandler, item}) =>
                    eventHandler.getConversationStateDelta({
                        id: item.id,
                        state: item.state,
                    }),
            };
        case 'conversation_part.tag.created':
            return {
                [Types.conversations.id]: ({eventHandler, item}) =>
                    eventHandler.getTagsIdsDelta({
                        id: item.id,
                        tags: item.tags.tags,
                    }),
                [Types.tags.id]: ({eventHandler, item}) =>
                    eventHandler.getNewTagsDelta({
                        tags: item.tags_added.tags,
                    }),
            };
        case 'company.created':
            return {
                [Types.companies.id]: ({eventHandler, item}) =>
                    eventHandler.getCompanyDelta({
                        id: item.id,
                    }),
            };
        case 'user.created':
        case 'contact.created':
            return {
                [Types.contacts.id]: async ({eventHandler, item}) => {
                    try {
                        const delta = await eventHandler.getContactDelta({
                            id: item.id,
                        });

                        return delta;
                    } catch (err) {
                        log.error(
                            `Skipping error: ${
                                err.message
                            } Item: ${JSON.stringify(item)}`,
                            err,
                        );
                        return [];
                    }
                },
            };
        case 'contact.tag.created':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getContactDelta({
                        id: item.contact.id,
                    }),
                [Types.tags.id]: ({eventHandler, item}) =>
                    eventHandler.getNewTagsDelta({
                        tags: [item.tag],
                    }),
            };
        case 'user.tag.created':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getContactDelta({
                        id: item.user.id,
                    }),
                [Types.tags.id]: ({eventHandler, item}) =>
                    eventHandler.getNewTagsDelta({
                        tags: [item.tag],
                    }),
            };
        case 'contact.tag.deleted':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getTagsIdsDelta({
                        id: item.contact.id,
                        tags: item.contact.tags.tags,
                    }),
            };
        case 'user.tag.deleted':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getTagsIdsDelta({
                        id: item.user.id,
                        tags: item.user.tags.tags,
                    }),
            };
        case 'user.deleted':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getRemoveDelta({id: item.id}),
            };
        case 'user.email.updated':
            return {
                [Types.contacts.id]: ({eventHandler, item}) =>
                    eventHandler.getEmailDelta({
                        id: item.id,
                        email: item.email,
                    }),
            };
        default:
            return {};
    }
};

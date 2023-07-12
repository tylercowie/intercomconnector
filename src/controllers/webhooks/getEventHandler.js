import {
    fetchCompany,
    fetchContact,
    listContactTags,
} from '../../connector/api.js';
import {Types} from '../config/types.js';
import {fetchAllContactCompanies} from '../data/fetchAllContactCompanies.js';
import {fetchDetailedConversation} from '../data/fetchDetailedConversation.js';
import {formatItem} from '../data/formatItems.js';

const getId = ({id}) => id;

export const getEventHandler = ({schemaProvider, account}) => {
    return {
        async getConversationDelta({id}) {
            const schema = await schemaProvider.getSchema({
                source: Types.conversations.id,
                account,
            });

            // fetch conversation because webhook payload doesn't have all chat history
            const conversation = await fetchDetailedConversation({
                id,
                account,
            });

            return [formatItem(schema, account, conversation)];
        },

        async getNewTagsDelta({tags}) {
            const schema = await schemaProvider.getSchema({
                source: Types.tags.id,
                account,
            });

            return tags.map((tag) => formatItem(schema, account, tag));
        },

        async getCompanyDelta({id}) {
            const schema = await schemaProvider.getSchema({
                source: Types.companies.id,
                account,
            });

            // fetch company because webhook payload sometimes doesn't have name
            // https://forum.intercom.com/s/feed/0D52G00004dXcnpSAC
            const {body} = await fetchCompany({
                id,
                token: account.token,
            });

            return [formatItem(schema, account, body)];
        },

        async getContactDelta({id}) {
            const schema = await schemaProvider.getSchema({
                source: Types.contacts.id,
                account,
            });

            // fetch contact because webhook payload doesn't contain Contact type but returns different one
            // https://forum.intercom.com/s/feed/0D52G00004dXcnpSAC
            const {body} = await fetchContact({
                id,
                token: account.token,
            });

            const getAllContactTags = async () => {
                const {body: tags} = await listContactTags({
                    token: account.token,
                    id: id,
                });

                return tags;
            };

            const [companies, tags] = await Promise.all([
                body.companies.has_more
                    ? fetchAllContactCompanies({account, filter: {id}})
                    : body.companies,
                body.tags.has_more ? getAllContactTags() : body.tags,
            ]);

            const user = {
                ...body,
                companies,
                tags,
            };

            return [formatItem(schema, account, user)];
        },

        async getConversationStateDelta({id, state}) {
            return [
                {
                    id,
                    state,
                    __syncAction: 'SET',
                },
            ];
        },

        async getTagsIdsDelta({id, tags}) {
            return [
                {
                    id: id,
                    tagsIds: tags.map(getId),
                    __syncAction: 'SET',
                },
            ];
        },

        async getEmailDelta({id, email}) {
            return [
                {
                    id,
                    email,
                    __syncAction: 'SET',
                },
            ];
        },

        async getRemoveDelta({id}) {
            return [
                {
                    id,
                    __syncAction: 'REMOVE',
                },
            ];
        },
    };
};

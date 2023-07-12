import {Types, Filters} from './types.js';

export const getSyncConfig = () => {
    return {
        webhooks: {enabled: true},
        types: [
            Types.conversations,
            Types.contacts,
            Types.companies,
            Types.tags,
            Types.admins,
        ],
        filters: [Filters.updated_at],
    };
};

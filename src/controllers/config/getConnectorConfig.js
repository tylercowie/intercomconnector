import {config} from '../../config/config.js';
import {env} from '../../config/env.js';
import {AuthTypes, Filters, Types} from './types.js';

const authentication = env.isDevelopment
    ? [AuthTypes.oauth2, AuthTypes.token]
    : [AuthTypes.oauth2];

export const getConnectorConfig = () => ({
    name: 'Intercom',
    id: 'intercomapp',
    type: 'crunch',
    website: 'https://www.intercom.com/',
    version: config.version,
    description: 'Get data from Intercom',
    authentication,
    sources: [
        {
            ...Types.contacts,
            filter: [Filters.role, Filters.updated_at],
        },
        {
            ...Types.companies,
            filter: [Filters.updated_at],
        },
        {
            ...Types.conversations,
            filter: [Filters.updated_at],
        },
    ],
    responsibleFor: {
        dataSynchronization: true,
        dataImport: false,
    },
});

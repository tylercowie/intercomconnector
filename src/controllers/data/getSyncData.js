import dateFns from 'date-fns';
import {badRequest} from '../../errors.js';
import {fetchCompanies} from './fetchCompanies.js';
import {fetchContacts} from './fetchContacts.js';
import {fetchConversations} from './fetchConverstaions.js';
import {fetchTags} from './fetchTags.js';
import {fetchAdmins} from './fetchAdmins.js';
import {formatItems} from './formatItems.js';

const fetchers = {
    contacts: fetchContacts,
    companies: fetchCompanies,
    conversations: fetchConversations,
    tags: fetchTags,
    admins: fetchAdmins,
};

const DELTA_HOURS = 6;

const adjustLastSynchronizedAt = (lastSynchronizedAt) =>
    lastSynchronizedAt
        ? dateFns.subHours(new Date(lastSynchronizedAt), DELTA_HOURS)
        : lastSynchronizedAt;

export const getSyncData = ({schemaProvider}) => async ({
    requestedType,
    filter,
    account,
    pagination,
    lastSynchronizedAt,
}) => {
    const fetcher = fetchers[requestedType];

    if (!fetcher) {
        throw badRequest(`Unknown type: [${requestedType}]`);
    }
    const schema = await schemaProvider.getSchema({
        source: requestedType,
        account,
    });

    const res = await fetcher({
        filter,
        account,
        pagination: pagination || {},
        lastSynchronizedAt: adjustLastSynchronizedAt(lastSynchronizedAt),
    });

    return {
        items: formatItems(schema, account, res.items),
        pagination: res.pagination,
        synchronizationType: res.synchronizationType,
    };
};

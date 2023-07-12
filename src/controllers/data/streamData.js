import JSONStream from 'JSONStream';
import {log} from '../../log.js';
import {badRequest} from '../../errors.js';
import {transformError} from '../../transformError.js';
import {fetchContacts} from './fetchContacts.js';
import {fetchCompanies} from './fetchCompanies.js';
import {fetchConversations} from './fetchConverstaions.js';
import {formatItem} from './formatItems.js';
import {fetchTags} from './fetchTags.js';
import {fetchAdmins} from './fetchAdmins.js';

const fetchToStream = async (fetcher, stream, schema, {account, filter}) => {
    try {
        let hasNext = true;
        let pagination = {};

        while (hasNext) {
            const res = await fetcher({
                account,
                filter,
                pagination,
            });

            res.items.forEach((item) =>
                stream.write(formatItem(schema, account, item)),
            );

            hasNext = res.pagination.hasNext;
            pagination = res.pagination.nextPageConfig;
        }
    } catch (err) {
        const error = transformError(err);
        log.error(`ERROR STREAMING:`, error);
        stream.write({
            __streamError: {
                message: error.message,
                code: error.status,
            },
        });
    } finally {
        stream.end();
    }
};

const fetchers = {
    contacts: fetchContacts,
    companies: fetchCompanies,
    conversations: fetchConversations,
    tags: fetchTags,
    admins: fetchAdmins,
};

export const streamData = ({schemaProvider}) => async ({
    source,
    account,
    filter,
}) => {
    const fetcher = fetchers[source];

    if (!fetcher) {
        throw badRequest(`Unknown source type: ${source}`);
    }

    const schema = await schemaProvider.getSchema({source, account});

    const stream = JSONStream.stringify();

    fetchToStream(fetcher, stream, schema, {account, filter});

    return stream;
};

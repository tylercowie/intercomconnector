import {listContactTags, searchContacts} from '../../connector/api.js';
import {log} from '../../log.js';
import {Filters} from '../config/types.js';
import {buildSearchQuery} from './buildSearchQuery.js';
import {getMaxTimestamp} from './dateConverters.js';
import {fetchAllContactCompanies} from './fetchAllContactCompanies.js';

export const fetchContacts = async ({
    account,
    filter,
    pagination,
    lastSynchronizedAt,
}) => {
    const timer = log.startTimer();

    const {
        body: {data, pages},
    } = await searchContacts({
        token: account.token,
        startingAfter: pagination.starting_after,
        query: buildSearchQuery([
            {filter: Filters.role, value: filter.role},
            {
                filter: Filters.updated_at,
                value: getMaxTimestamp(filter.updated_at, lastSynchronizedAt),
            },
        ]),
    });

    const completeData = await Promise.all(
        data.map(async (contact) => {
            const replace = {};

            if (contact.companies.has_more) {
                const companies = await fetchAllContactCompanies({
                    account,
                    filter: {id: contact.id},
                });

                replace.companies = companies;
            }

            if (contact.tags.has_more) {
                const {body: tags} = await listContactTags({
                    token: account.token,
                    id: contact.id,
                });

                replace.tags = tags;
            }

            return {
                ...contact,
                ...replace,
            };
        }),
    );

    timer.done(
        `Fetched contacts: page - ${pages.page} total_pages - ${pages.total_pages}`,
    );

    return {
        items: completeData,
        pagination: {
            hasNext: Boolean(pages.next),
            nextPageConfig: pages.next,
        },
        synchronizationType: lastSynchronizedAt ? 'delta' : 'full',
    };
};

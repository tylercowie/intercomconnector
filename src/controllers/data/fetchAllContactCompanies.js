import {fetchContactCompanies} from '../../connector/api.js';
import {log} from '../../log.js';

export const fetchAllContactCompanies = async ({account, filter: {id}}) => {
    let hasNext = true;
    let page = 1;
    let companies = [];

    while (hasNext) {
        const timer = log.startTimer();

        const {
            body: {data, pages},
        } = await fetchContactCompanies({
            token: account.token,
            id,
            page,
        });

        companies = companies.concat(data);
        hasNext = Boolean(pages.next);
        page++;

        timer.done(
            `Fetched companies of contact: page - ${pages.page} total_pages - ${pages.total_pages}`,
        );
    }

    return {data: companies, has_more: false};
};

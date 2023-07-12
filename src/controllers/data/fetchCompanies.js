import {scrollCompanies} from '../../connector/api.js';
import {log} from '../../log.js';
import {getMaxTimestamp} from './dateConverters.js';

const getDateboxFilter = (datebox) => (item) => item.updated_at >= datebox;

const filterData = (filter, lastSynchronizedAt, data) => {
    const updatedAt = getMaxTimestamp(lastSynchronizedAt, filter.updated_at);

    if (updatedAt) {
        return data.filter(getDateboxFilter(updatedAt));
    } else {
        return data;
    }
};

export const fetchCompanies = async ({
    account,
    filter,
    pagination,
    lastSynchronizedAt,
}) => {
    const timer = log.startTimer();
    const {
        body: {data, scroll_param: scrollParam},
    } = await scrollCompanies({
        token: account.token,
        scrollParam: pagination.scrollParam,
    });

    const hasNext = data.length > 0;

    const filtered = filterData(filter, lastSynchronizedAt, data);

    timer.done(
        `Fetched ${data.length}, filtered ${filtered.length} companies: scroll_param - ${scrollParam} hasNext - ${hasNext}`,
    );

    return {
        items: filtered,
        pagination: {
            hasNext,
            nextPageConfig: {scrollParam},
        },
        synchronizationType: lastSynchronizedAt ? 'delta' : 'full',
    };
};

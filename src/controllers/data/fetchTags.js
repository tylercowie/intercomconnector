import {listTags} from '../../connector/api.js';
import {log} from '../../log.js';

export const fetchTags = async ({account}) => {
    const timer = log.startTimer();
    const {
        body: {data},
    } = await listTags({
        token: account.token,
    });

    timer.done(`Fetched ${data.length} tags`);

    return {
        items: data,
        pagination: {
            hasNext: false,
        },
        synchronizationType: 'full',
    };
};

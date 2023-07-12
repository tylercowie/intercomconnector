import {listAdmins} from '../../connector/api.js';
import {log} from '../../log.js';

export const fetchAdmins = async ({account}) => {
    const timer = log.startTimer();
    const {
        body: {admins, pages},
    } = await listAdmins({
        token: account.token,
    });

    timer.done(
        `Fetched ${admins.length} admins, pages: ${JSON.stringify(pages)}`,
    );

    return {
        items: admins,
        pagination: {
            hasNext: false,
        },
        synchronizationType: 'full',
    };
};

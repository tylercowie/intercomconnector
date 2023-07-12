import {API_VERSION, getMe} from '../connector/api.js';
import {forbidden} from '../errors.js';
import {createAccountsCollection} from '../models/accountsCollection.js';

export const validateAccount = async ({mongoClient}, config) => {
    const {headers, body} = await getMe({token: config.fields.token});

    if (headers['intercom-version'] !== API_VERSION) {
        throw forbidden(
            `Oops, looks like your app uses different API version. Fibery uses Intercom API ${API_VERSION}. Please consider switching to the same version if it's an option for you. https://developers.intercom.com/building-apps/docs/update-your-api-version`,
        );
    }

    const accountsCollection = createAccountsCollection(mongoClient);

    await accountsCollection.setById(body.id, {token: config.fields.token});

    return {
        accountId: body.id,
        name: `${body.name} (${body.app.name})`,
        email: body.email,
        intercomAppId: body.app.id_code,
    };
};

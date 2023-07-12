import nock from 'nock';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';
import {userBuilder} from './mocks/userBuilder.js';

const API_VERSION = '2.2';

describe(`POST /validate`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get account`, async () => {
        const user = userBuilder();
        const token = `test_token`;
        nock(`https://api.intercom.io`, {
            reqheaders: {
                Authorization: `Bearer ${token}`,
            },
        })
            .get(`/me`)
            .reply(200, user, {
                'Intercom-Version': API_VERSION,
            });

        const res = await restClient.validate({token});

        expect(res.body).toEqual({
            accountId: user.id,
            name: `${user.name} (${user.app.name})`,
            email: user.email,
            intercomAppId: user.app.id_code,
        });
    });

    it(`should return 403 when user's APP uses wrong Intercom-Version`, async () => {
        const user = userBuilder();
        const token = `test_token`;
        nock(`https://api.intercom.io`, {
            reqheaders: {
                Authorization: `Bearer ${token}`,
            },
        })
            .get(`/me`)
            .reply(200, user, {
                'Intercom-Version': '1.0',
            });

        const res = await restClient.validate({token});

        expect(res.statusCode).toEqual(403);
        expect(res.body).toEqual({
            message: `Oops, looks like your app uses different API version. Fibery uses Intercom API ${API_VERSION}. Please consider switching to the same version if it's an option for you. https://developers.intercom.com/building-apps/docs/update-your-api-version`,
            status: 403,
        });
    });

    it(`should return handle wrong token`, async () => {
        const token = `test_token`;
        nock(`https://api.intercom.io`)
            .get(`/me`)
            .reply(401, {
                type: 'error.list',
                request_id: 'request_id',
                errors: [{code: 'token_unauthorized', message: 'Unauthorized'}],
            });

        const res = await restClient.validate({token});

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({message: 'Unauthorized', status: 401});
    });

    afterAll(async () => {
        await app.destroy();
    });
});

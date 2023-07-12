import nock from 'nock';
import crypto from 'crypto';
import {createTestApp} from '../testApp.js';
import {getRestClient} from '../restClient.js';

const getSignature = (payload, secret) =>
    `sha1=${crypto
        .createHmac('sha1', secret)
        .update(JSON.stringify(payload))
        .digest('hex')}`;

describe(`POST /api/v1/synchronizer/webhooks/income`, () => {
    const clientSecret = 'test-secret';

    const account = {
        token: 'token',
        intercomAppId: 'intercom_app_id',
        auth: 'oauth2',
    };
    let app;
    let restClient;
    let collection;

    beforeAll(async () => {
        app = await createTestApp({clientSecret});
        restClient = getRestClient(app.url);
        const db = await app.mongoClient.connect();
        collection = db.collection('webhook');
    });

    afterEach(async () => {
        if (collection) {
            await collection.drop();
        }
    });

    it(`should return 400 for wrong signature`, async () => {
        const types = ['conversations'];
        const url = 'https://sync-service/api/webhooks/sync-sources/1';

        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);

        const payload = {
            app_id: account.intercomAppId,
            topic: 'conversation.admin.replied',
            data: {},
        };

        const incomeRes = await restClient.incomeWebhook(payload, {
            'x-hub-signature': getSignature(payload, 'HACKED_SECRET'),
        });

        expect(incomeRes.statusCode).toEqual(400);
    });

    it(`should call webhooks registered with corresponding types`, async () => {
        const types = ['conversations'];
        const url = 'https://sync-service/api/webhooks/sync-sources/1';

        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);

        const body = {
            app_id: account.intercomAppId,
            topic: 'conversation.admin.replied',
            data: {},
        };
        const headers = {
            'x-hub-signature': getSignature(body, clientSecret),
        };

        const scope = nock(`https://sync-service`, {
            reqheaders: {
                'x-hub-signature': headers['x-hub-signature'],
            },
        })
            .post(`/api/webhooks/sync-sources/1`, body)
            .reply(200, {processed: true});

        const incomeRes = await restClient.incomeWebhook(body, headers);

        expect(incomeRes.statusCode).toEqual(200);
        scope.done();
    });
    it(`should return 200 even if there was error in processing webhook`, async () => {
        const types = ['conversations'];
        const url = 'https://sync-service/api/webhooks/sync-sources/1';

        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);

        const body = {
            app_id: account.intercomAppId,
            topic: 'conversation.admin.replied',
            data: {},
        };
        const headers = {'x-hub-signature': getSignature(body, clientSecret)};

        const scope = nock(`https://sync-service`, {
            reqheaders: headers,
        })
            .post(`/api/webhooks/sync-sources/1`, body)
            .reply(500, {});

        const incomeRes = await restClient.incomeWebhook(body, headers);

        expect(incomeRes.statusCode).toEqual(200);
        scope.done();
    });

    afterAll(async () => {
        await app.destroy();
    });
});

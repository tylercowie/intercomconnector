import {createTestApp} from '../testApp.js';
import {getRestClient} from '../restClient.js';

describe(`POST /api/v1/synchronizer/webhooks`, () => {
    const account = {
        token: 'token',
        intercomAppId: 'intercom_app_id',
        auth: 'oauth2',
    };
    let app;
    let restClient;
    let collection;
    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
        const db = await app.mongoClient.connect();
        collection = db.collection('webhook');
    });
    afterEach(async () => {
        if (collection) {
            await collection.drop();
        }
    });
    it(`should delete webhook`, async () => {
        const types = ['conversations', 'tags'];
        const url = 'https://webhooks.com';
        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });
        expect(res.statusCode).toEqual(200);
        const document = await collection.findOne({url});
        const webhook = {
            id: account.intercomAppId,
            hookId: String(document._id),
            types,
            createdAt: document.createdAt.toISOString(),
            updatedAt: document.updatedAt.toISOString(),
        };
        expect(res.body).toEqual(webhook);
        const deleteRes = await restClient.deleteWebhook({webhook});
        expect(deleteRes.statusCode).toEqual(200);
        const count = await collection.countDocuments({});
        expect(count).toEqual(0);
    });
    afterAll(async () => {
        await app.destroy();
    });
});

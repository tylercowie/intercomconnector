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
        try {
            if (collection) {
                await collection.drop();
            }
        } catch (err) {
            // collection wasn't created during test
            if (err.code !== 26) {
                throw err;
            }
        }
    });

    it(`should create webhook`, async () => {
        const types = ['conversations', 'tags'];
        const url = 'https://webhooks.com';
        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);
        const document = await collection.findOne({url});

        expect(res.body).toEqual({
            id: account.intercomAppId,
            hookId: String(document._id),
            types,
            createdAt: document.createdAt.toISOString(),
            updatedAt: document.updatedAt.toISOString(),
        });
    });
    it(`should update existing webhook`, async () => {
        const types = ['conversations'];
        const url = 'https://webhooks.com';
        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);

        const document = await collection.findOne({url});
        const beforeUpdate = {
            id: account.intercomAppId,
            hookId: String(document._id),
            types,
            createdAt: document.createdAt.toISOString(),
            updatedAt: document.updatedAt.toISOString(),
        };

        expect(res.body).toEqual(beforeUpdate);

        const resUpdated = await restClient.registerWebhook({
            account,
            webhook: beforeUpdate,
            types: ['conversations', 'tags'],
            url,
        });

        expect(resUpdated.statusCode).toEqual(200);

        const documentAfterUpdate = await collection.findOne({
            _id: document._id,
        });
        const afterUpdate = {
            id: account.intercomAppId,
            hookId: beforeUpdate.hookId,
            types: ['conversations', 'tags'],
            createdAt: beforeUpdate.createdAt,
            updatedAt: documentAfterUpdate.updatedAt.toISOString(),
        };

        expect(resUpdated.body).toEqual(afterUpdate);
    });
    it(`should return the same webhook when no changes`, async () => {
        const types = ['conversations'];
        const url = 'https://webhooks.com';
        const res = await restClient.registerWebhook({
            account,
            types,
            url,
        });

        expect(res.statusCode).toEqual(200);

        const document = await collection.findOne({url});
        const beforeUpdate = {
            id: account.intercomAppId,
            hookId: String(document._id),
            types,
            createdAt: document.createdAt.toISOString(),
            updatedAt: document.updatedAt.toISOString(),
        };

        expect(res.body).toEqual(beforeUpdate);

        const resUpdated = await restClient.registerWebhook({
            account,
            webhook: beforeUpdate,
            types,
            url,
        });

        expect(resUpdated.statusCode).toEqual(200);

        expect(resUpdated.body).toEqual(beforeUpdate);
    });

    it(`shouldn't create webhook for token-based accounts`, async () => {
        const types = ['conversations', 'tags'];
        const url = 'https://webhooks.com';
        const res = await restClient.registerWebhook({
            account: {
                token: 'token',
                intercomAppId: 'intercom_app_id',
                auth: 'token',
            },
            types,
            url,
        });

        expect(res.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

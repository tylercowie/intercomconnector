import {createTestApp} from '../testApp.js';
import {getRestClient} from '../restClient.js';

describe(`POST /api/v1/synchronizer/webhooks/verify`, () => {
    const clientSecret = 'test-secret';
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp({clientSecret});
        restClient = getRestClient(app.url);
    });

    it(`should return app id as webhook id`, async () => {
        const payload = {
            app_id: 'app_id',
            topic: 'conversation.admin.replied',
            data: {},
        };
        const params = {'x-hub-signature': 'sha1=crypto-key'};

        const res = await restClient.verifyWebhook({
            payload,
            params,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            id: payload.app_id,
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

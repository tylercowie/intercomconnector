import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`GET /status`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get status`, async () => {
        const res = await restClient.status();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            up: expect.any(String),
            memory: {
                rss: expect.any(String),
                heapUsed: expect.any(String),
                heapTotal: expect.any(String),
            },
            version: '1.1.0',
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

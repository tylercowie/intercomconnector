import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`GET /logo`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should respond with 200`, async () => {
        const res = await restClient.getLogo();

        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toEqual('image/svg+xml');
    });

    afterAll(async () => {
        await app.destroy();
    });
});

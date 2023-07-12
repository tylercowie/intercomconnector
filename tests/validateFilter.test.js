import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /validate/filter`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should respond with 200`, async () => {
        const token = `test_token`;

        const res = await restClient.validateFilter({account: {token}});

        expect(res.statusCode).toEqual(200);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

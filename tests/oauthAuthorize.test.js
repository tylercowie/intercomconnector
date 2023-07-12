import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /oauth2/v1/authorize`, () => {
    const clientId = 'test-id';
    const clientSecret = 'test-secret';
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp({clientId, clientSecret});
        restClient = getRestClient(app.url);
    });

    it(`should respond with redirect uri`, async () => {
        const state = 'test-state';
        const res = await restClient.authorize({state});

        expect(res.body).toEqual({
            redirect_uri: `https://app.intercom.com/oauth?state=${state}&client_id=${clientId}`,
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

import nock from 'nock';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /oauth2/v1/access_token`, () => {
    const clientId = 'test-id';
    const clientSecret = 'test-secret';
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp({clientId, clientSecret});
        restClient = getRestClient(app.url);
    });

    it(`should get access token`, async () => {
        const code = 'test-code';
        const expectedToken = 'test-token';

        const matchers = [
            /form-data; name="code"[^]\s*test-code/m,
            /form-data; name="client_id"[^]\s*test-id/m,
            /form-data; name="client_secret"[^]\s*test-secret/m,
        ];

        nock(`https://api.intercom.io`)
            .post(`/auth/eagle/token`, (body) => {
                return matchers.every((matcher) => matcher.test(body));
            })
            .reply(200, {
                token: expectedToken,
            });

        const res = await restClient.getAccessToken({code});

        expect(res.body).toEqual({
            token: expectedToken,
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

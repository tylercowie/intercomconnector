import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /datalist`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get datalist for contacts`, async () => {
        const res = await restClient.getDatalist({
            source: 'contacts',
            field: 'role',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchInlineSnapshot(`
            [
              {
                "title": "User",
                "value": "user",
              },
              {
                "title": "Lead",
                "value": "lead",
              },
            ]
        `);
    });

    it(`should return error for unknown field or source`, async () => {
        const resWithUnknownField = await restClient.getDatalist({
            source: 'contacts',
            field: 'unknown',
        });

        expect(resWithUnknownField.statusCode).toEqual(400);

        const resWithUnknownSource = await restClient.getDatalist({
            source: 'unknown',
            field: 'role',
        });

        expect(resWithUnknownSource.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

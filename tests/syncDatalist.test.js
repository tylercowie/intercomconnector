import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /api/v1/synchronizer/datalist`, () => {
    const token = 'token';
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get datalist for contacts`, async () => {
        const res = await restClient.getSyncDatalist({
            types: ['contacts'],
            field: 'role',
            account: {token},
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchInlineSnapshot(`
            {
              "items": [
                {
                  "title": "User",
                  "value": "user",
                },
                {
                  "title": "Lead",
                  "value": "lead",
                },
              ],
            }
        `);
    });

    it(`should get all datalists for provided types`, async () => {
        const res = await restClient.getSyncDatalist({
            types: ['contacts', 'companies', 'conversations'],
            field: 'role',
            account: {token},
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchInlineSnapshot(`
            {
              "items": [
                {
                  "title": "User",
                  "value": "user",
                },
                {
                  "title": "Lead",
                  "value": "lead",
                },
              ],
            }
        `);
    });

    it(`should return error for unknown field or source`, async () => {
        const resWithUnknownField = await restClient.getSyncDatalist({
            types: ['contacts'],
            field: 'unknown',
            account: {token},
        });

        expect(resWithUnknownField.statusCode).toEqual(400);

        const resWithUnknownType = await restClient.getSyncDatalist({
            types: ['unknown'],
            field: 'role',
            account: {token},
        });

        expect(resWithUnknownType.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

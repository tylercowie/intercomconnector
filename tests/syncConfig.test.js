import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`POST /api/v1/synchronizer/config`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get connector config`, async () => {
        const res = await restClient.getSyncConfig();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            webhooks: {
                enabled: true,
            },
            filters: [
                {
                    datalist: false,
                    defaultValue: expect.any(String),
                    id: 'updated_at',
                    optional: true,
                    title: 'Updated After',
                    type: 'datebox',
                },
            ],
            types: [
                {
                    description:
                        'Conversations are how you can communicate with users in Intercom. They are created when a contact replies to an outbound message, or when one admin directly sends a message to a single contact.',
                    id: 'conversations',
                    name: 'Conversation',
                    default: true,
                },
                {
                    description:
                        'The Contacts source provides details on these contacts within Intercom, and will specify whether they are a user or lead through the role attribute',
                    id: 'contacts',
                    name: 'Contact',
                    default: true,
                },
                {
                    description:
                        'Companies allow you to represent organizations using your product.',
                    id: 'companies',
                    name: 'Company',
                    default: true,
                },
                {
                    description:
                        'A tag allows you to label your contacts and companies and list them using that tag.',
                    id: 'tags',
                    name: 'Tag',
                },
                {
                    description:
                        'Admins are the teammate accounts that have access to a workspace.',
                    id: 'admins',
                    name: 'Teammate',
                    default: true,
                },
            ],
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

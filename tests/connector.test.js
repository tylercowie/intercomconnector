import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`GET /`, () => {
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get connector config`, async () => {
        const res = await restClient.getConnectorConfig();

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            authentication: [
                {
                    description: `OAuth-based authentication and authorization for access to Intercom`,
                    name: `OAuth Authentication`,
                    id: `oauth2`,
                    fields: [
                        {
                            title: `redirect_uri`,
                            description: `OAuth post-auth redirect URI`,
                            type: `oauth`,
                            id: `redirect_uri`,
                        },
                    ],
                },
            ],
            description: 'Get data from Intercom',
            id: 'intercomapp',
            name: 'Intercom',
            responsibleFor: {
                dataSynchronization: true,
                dataImport: false,
            },
            sources: [
                {
                    description:
                        'The Contacts source provides details on these contacts within Intercom, and will specify whether they are a user or lead through the role attribute',
                    filter: [
                        {
                            datalist: true,
                            id: 'role',
                            optional: true,
                            title: 'Role',
                            type: 'multidropdown',
                        },
                        {
                            datalist: false,
                            defaultValue: expect.any(String),
                            id: 'updated_at',
                            optional: true,
                            title: 'Updated After',
                            type: 'datebox',
                        },
                    ],
                    id: 'contacts',
                    name: 'Contact',
                    default: true,
                },
                {
                    description:
                        'Companies allow you to represent organizations using your product.',
                    filter: [
                        {
                            datalist: false,
                            defaultValue: expect.any(String),
                            id: 'updated_at',
                            optional: true,
                            title: 'Updated After',
                            type: 'datebox',
                        },
                    ],
                    id: 'companies',
                    name: 'Company',
                    default: true,
                },
                {
                    description:
                        'Conversations are how you can communicate with users in Intercom. They are created when a contact replies to an outbound message, or when one admin directly sends a message to a single contact.',
                    filter: [
                        {
                            datalist: false,
                            defaultValue: expect.any(String),
                            id: 'updated_at',
                            optional: true,
                            title: 'Updated After',
                            type: 'datebox',
                        },
                    ],
                    id: 'conversations',
                    name: 'Conversation',
                    default: true,
                },
            ],
            type: 'crunch',
            version: '1.1.0',
            website: 'https://www.intercom.com/',
        });
    });

    afterAll(async () => {
        await app.destroy();
    });
});

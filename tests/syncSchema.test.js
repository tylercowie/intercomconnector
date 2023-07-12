import nock from 'nock';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';
import {dataAttributeBuilder} from './mocks/dataAttributeBuilder.js';

describe(`POST /api/v1/synchronizer/schema`, () => {
    let app;
    let restClient;
    const token = 'syncSchema_token';
    const intercom = nock(`https://api.intercom.io`, {
        reqheaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get schema for requested types`, async () => {
        const contactNameAttr = dataAttributeBuilder({
            overrides: {name: 'name'},
            traits: ['contact', 'string', 'custom'],
        });
        const companyNameAttr = dataAttributeBuilder({
            overrides: {name: 'name'},
            traits: ['company', 'string', 'custom'],
        });

        intercom
            .get(`/data_attributes`)
            .query({model: 'contact'})
            .reply(200, {
                type: 'list',
                data: [contactNameAttr],
            })
            .get(`/data_attributes`)
            .query({model: 'company'})
            .reply(200, {
                type: 'list',
                data: [companyNameAttr],
            });

        const res = await restClient.getSyncSchema({
            types: ['contacts', 'companies'],
            account: {token},
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchInlineSnapshot(`
            {
              "companies": {
                "__syncAction": {
                  "name": "  syncAction",
                  "order": 16,
                  "type": "text",
                },
                "company_id": {
                  "name": "company id",
                  "order": 13,
                  "type": "id",
                },
                "created_at": {
                  "name": "created at",
                  "order": 8,
                  "type": "date",
                },
                "id": {
                  "name": "id",
                  "order": 0,
                  "type": "id",
                },
                "industry": {
                  "name": "industry",
                  "order": 12,
                  "type": "text",
                },
                "intercomLink": {
                  "description": "Link to original conversation",
                  "name": "Intercom Link",
                  "order": 6,
                  "subType": "url",
                  "type": "text",
                },
                "last_request_at": {
                  "name": "last request at",
                  "order": 7,
                  "type": "date",
                },
                "monthly_spend": {
                  "name": "monthly spend",
                  "order": 4,
                  "type": "number",
                },
                "name": {
                  "description": "Attribute description",
                  "name": "name",
                  "order": 1,
                  "type": "text",
                },
                "plan.name": {
                  "name": "plan#name",
                  "order": 10,
                  "type": "text",
                },
                "remote_created_at": {
                  "name": "remote created at",
                  "order": 14,
                  "type": "date",
                },
                "session_count": {
                  "name": "session count",
                  "order": 9,
                  "subType": "integer",
                  "type": "number",
                },
                "size": {
                  "name": "size",
                  "order": 11,
                  "subType": "integer",
                  "type": "number",
                },
                "tagsIds": {
                  "description": "A list of tags associated with the company.",
                  "name": "tagsIds",
                  "order": 2,
                  "relation": {
                    "cardinality": "many-to-many",
                    "name": "Tags",
                    "targetFieldId": "id",
                    "targetName": "Companies",
                    "targetType": "tags",
                  },
                  "type": "array[text]",
                },
                "updated_at": {
                  "name": "updated at",
                  "order": 15,
                  "type": "date",
                },
                "user_count": {
                  "name": "user count",
                  "order": 3,
                  "subType": "integer",
                  "type": "number",
                },
                "website": {
                  "name": "website",
                  "order": 5,
                  "subType": "url",
                  "type": "text",
                },
              },
              "contacts": {
                "__syncAction": {
                  "name": "  syncAction",
                  "order": 28,
                  "type": "text",
                },
                "browser": {
                  "name": "browser",
                  "order": 21,
                  "type": "text",
                },
                "browser_language": {
                  "name": "browser language",
                  "order": 19,
                  "type": "text",
                },
                "browser_version": {
                  "name": "browser version",
                  "order": 22,
                  "type": "text",
                },
                "companiesIds": {
                  "description": "The companies which the contact belongs to.",
                  "name": "companiesIds",
                  "order": 2,
                  "relation": {
                    "cardinality": "many-to-many",
                    "name": "Companies",
                    "targetFieldId": "id",
                    "targetName": "Contacts",
                    "targetType": "companies",
                  },
                  "type": "array[text]",
                },
                "created_at": {
                  "name": "created at",
                  "order": 12,
                  "type": "date",
                },
                "email": {
                  "name": "email",
                  "order": 4,
                  "subType": "email",
                  "type": "text",
                },
                "external_id": {
                  "name": "external id",
                  "order": 10,
                  "type": "id",
                },
                "has_hard_bounced": {
                  "name": "has hard bounced",
                  "order": 26,
                  "subType": "boolean",
                  "type": "text",
                },
                "id": {
                  "name": "id",
                  "order": 0,
                  "type": "id",
                },
                "intercomLink": {
                  "description": "Link to original conversation",
                  "name": "Intercom Link",
                  "order": 8,
                  "subType": "url",
                  "type": "text",
                },
                "language_override": {
                  "name": "language override",
                  "order": 20,
                  "type": "text",
                },
                "last_contacted_at": {
                  "name": "last contacted at",
                  "order": 15,
                  "type": "date",
                },
                "last_email_clicked_at": {
                  "name": "last email clicked at",
                  "order": 18,
                  "type": "date",
                },
                "last_email_opened_at": {
                  "name": "last email opened at",
                  "order": 17,
                  "type": "date",
                },
                "last_replied_at": {
                  "name": "last replied at",
                  "order": 16,
                  "type": "date",
                },
                "last_seen_at": {
                  "name": "last seen at",
                  "order": 14,
                  "type": "date",
                },
                "location.city": {
                  "name": "location#city",
                  "order": 7,
                  "type": "text",
                },
                "location.country": {
                  "name": "location#country",
                  "order": 5,
                  "type": "text",
                },
                "location.region": {
                  "name": "location#region",
                  "order": 6,
                  "type": "text",
                },
                "marked_email_as_spam": {
                  "name": "marked email as spam",
                  "order": 25,
                  "subType": "boolean",
                  "type": "text",
                },
                "name": {
                  "description": "Attribute description",
                  "name": "name",
                  "order": 1,
                  "type": "text",
                },
                "os": {
                  "name": "os",
                  "order": 23,
                  "type": "text",
                },
                "owner_id": {
                  "name": "owner id",
                  "order": 9,
                  "type": "id",
                },
                "phone": {
                  "name": "phone",
                  "order": 11,
                  "type": "text",
                },
                "role": {
                  "name": "role",
                  "order": 27,
                  "type": "text",
                },
                "signed_up_at": {
                  "name": "signed up at",
                  "order": 13,
                  "type": "date",
                },
                "tagsIds": {
                  "description": "The tags which have been added to the contact.",
                  "name": "tagsIds",
                  "order": 3,
                  "relation": {
                    "cardinality": "many-to-many",
                    "name": "Tags",
                    "targetFieldId": "id",
                    "targetName": "Contacts",
                    "targetType": "tags",
                  },
                  "type": "array[text]",
                },
                "unsubscribed_from_emails": {
                  "name": "unsubscribed from emails",
                  "order": 24,
                  "subType": "boolean",
                  "type": "text",
                },
              },
            }
        `);
    });

    it(`should return error for unknown field or source`, async () => {
        const resWithUnknownField = await restClient.getSchema({
            types: ['unknown'],
            account: {token},
        });

        expect(resWithUnknownField.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

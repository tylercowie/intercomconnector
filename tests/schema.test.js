import nock from 'nock';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';
import {dataAttributeBuilder} from './mocks/dataAttributeBuilder.js';

describe(`POST /schema`, () => {
    let app;
    let restClient;
    const token = 'schema_token';
    const intercom = nock(`https://api.intercom.io`, {
        reqheaders: {
            Authorization: `Bearer ${token}`,
        },
    });

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it(`should get schema for contacts`, async () => {
        const model = 'contact';
        const idAttr = dataAttributeBuilder({
            overrides: {
                name: 'id',
                description: 'should add data to existing field',
            },
            traits: [model, 'string'],
        });
        const notCustomAttr = dataAttributeBuilder({
            overrides: {name: 'Should Be IGNORED'},
            traits: [model, 'date'],
        });
        const customAttr = dataAttributeBuilder({
            overrides: {
                name: 'custom.prop',
                description: 'custom should be added to schema',
            },
            traits: [model, 'date', 'custom'],
        });

        intercom
            .get(`/data_attributes`)
            .query({model})
            .reply(200, {
                type: 'list',
                data: [idAttr, notCustomAttr, customAttr],
            });

        const contactsRes = await restClient.getSchema({
            source: 'contacts',
            account: {token},
        });

        expect(contactsRes.statusCode).toEqual(200);
        expect(contactsRes.body).toMatchInlineSnapshot(`
            {
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
              "custom.prop": {
                "description": "custom should be added to schema",
                "name": "custom#prop",
                "order": 29,
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
                "description": "should add data to existing field",
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
            }
        `);
    });

    it(`should get schema for conversations`, async () => {
        const conversationsRes = await restClient.getSchema({
            account: {token},
            source: 'conversations',
        });

        expect(conversationsRes.statusCode).toEqual(200);
        expect(conversationsRes.body).toMatchInlineSnapshot(`
            {
              "__syncAction": {
                "name": "  syncAction",
                "order": 24,
                "type": "text",
              },
              "contactsIds": {
                "description": "The list of contacts (users or leads) involved in this conversation.",
                "name": "contactsIds",
                "order": 3,
                "relation": {
                  "cardinality": "many-to-many",
                  "name": "Contacts",
                  "targetFieldId": "id",
                  "targetName": "Conversations",
                  "targetType": "contacts",
                },
                "type": "array[text]",
              },
              "created_at": {
                "description": "The time the conversation was created.",
                "name": "Created At",
                "order": 15,
                "type": "date",
              },
              "files": {
                "name": "files",
                "order": 23,
                "subType": "file",
                "type": "array[text]",
              },
              "first_contact_reply.url": {
                "description": "The URL where the first reply originated from. For Twitter and Email replies, this will be blank.",
                "name": "First Contact Reply URL",
                "order": 10,
                "subType": "url",
                "type": "text",
              },
              "id": {
                "description": "The id representing the conversation.",
                "name": "id",
                "order": 0,
                "type": "id",
              },
              "intercomLink": {
                "description": "Link to original conversation",
                "name": "Intercom Link",
                "order": 9,
                "subType": "url",
                "type": "text",
              },
              "name": {
                "name": "name",
                "order": 1,
                "type": "text",
              },
              "priority": {
                "description": "If marked as priority, it will return priority or else not_priority.",
                "name": "Priority",
                "order": 13,
                "subType": "boolean",
                "type": "text",
              },
              "read": {
                "description": "Indicates whether a conversation has been read.",
                "name": "Read",
                "order": 12,
                "subType": "boolean",
                "type": "text",
              },
              "sla_applied.sla_name": {
                "description": "The name of the SLA as given by the teammate when it was created.",
                "name": "SLA Name",
                "order": 21,
                "type": "text",
              },
              "sla_applied.sla_status": {
                "description": "One of “hit”, ”missed”, or “cancelled”.",
                "name": "SLA Status",
                "order": 22,
                "type": "text",
              },
              "source.author.email": {
                "name": "Author Email",
                "order": 8,
                "subType": "email",
                "type": "text",
              },
              "source.author.name": {
                "name": "Author Name",
                "order": 7,
                "type": "text",
              },
              "source.body": {
                "description": "The message body, which may contain HTML. For Twitter, this will show a generic message regarding why the body is obscured.",
                "name": "Messages",
                "order": 2,
                "subType": "html",
                "type": "array[text]",
                "writable": true,
              },
              "source.delivered_as": {
                "description": "Optional. The message subject. For Twitter, this will show a generic message regarding why.",
                "name": "Delivered As ",
                "order": 14,
                "type": "text",
              },
              "source.subject": {
                "description": "Optional. The message subject. For Twitter, this will show a generic message regarding why the subject is obscured.",
                "name": "Subject",
                "order": 11,
                "type": "text",
              },
              "state": {
                "description": "Can be set to "open", "closed" or "snoozed".",
                "important": true,
                "name": "State",
                "order": 6,
                "type": "text",
              },
              "statistics.first_admin_reply_at": {
                "description": "Time of first admin reply after first_contact_reply_at.",
                "name": "First Admin Reply At",
                "order": 17,
                "type": "date",
              },
              "statistics.first_contact_reply_at": {
                "description": "Time of first text conversation part from a contact.",
                "name": "First Contact Reply At",
                "order": 16,
                "type": "date",
              },
              "statistics.last_admin_reply_at": {
                "description": "Time of the last conversation part from an admin.",
                "name": "Last Admin Reply At",
                "order": 19,
                "type": "date",
              },
              "statistics.last_contact_reply_at": {
                "description": "Time of the last conversation part from a contact.",
                "name": "Last Contact Reply At",
                "order": 18,
                "type": "date",
              },
              "tagsIds": {
                "description": "A list of tags associated with the conversation.",
                "name": "tagsIds",
                "order": 5,
                "relation": {
                  "cardinality": "many-to-many",
                  "name": "Tags",
                  "targetFieldId": "id",
                  "targetName": "Conversations",
                  "targetType": "tags",
                },
                "type": "array[text]",
              },
              "teammatesIds": {
                "description": "The list of teammates who participated in the conversation (wrote at least one conversation part).",
                "name": "teammatesIds",
                "order": 4,
                "relation": {
                  "cardinality": "many-to-many",
                  "name": "Teammates",
                  "targetFieldId": "id",
                  "targetName": "Conversations",
                  "targetType": "admins",
                },
                "type": "array[text]",
              },
              "updated_at": {
                "description": "The last time the conversation was updated.",
                "name": "Updated At",
                "order": 20,
                "type": "date",
              },
            }
        `);
    });

    it(`should get schema for companies`, async () => {
        const model = 'company';
        const idAttr = dataAttributeBuilder({
            overrides: {
                name: 'id',
                description: 'should add data to existing field',
            },
            traits: [model, 'string'],
        });
        const notCustomAttr = dataAttributeBuilder({
            overrides: {name: 'Should Be IGNORED'},
            traits: [model, 'date'],
        });
        const customAttr = dataAttributeBuilder({
            overrides: {
                name: 'custom.prop',
                description: 'custom should be added to schema',
            },
            traits: [model, 'float', 'custom'],
        });

        intercom
            .get(`/data_attributes`)
            .query({model})
            .reply(200, {
                type: 'list',
                data: [idAttr, notCustomAttr, customAttr],
            });

        const companiesRes = await restClient.getSchema({
            source: 'companies',
            account: {token},
        });

        expect(companiesRes.statusCode).toEqual(200);
        expect(companiesRes.body).toMatchInlineSnapshot(`
            {
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
              "custom.prop": {
                "description": "custom should be added to schema",
                "name": "custom#prop",
                "order": 17,
                "type": "number",
              },
              "id": {
                "description": "should add data to existing field",
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
            }
        `);
    });

    it(`should return error for unknown field or source`, async () => {
        const resWithUnknownField = await restClient.getSchema({
            source: 'unknown',
        });

        expect(resWithUnknownField.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

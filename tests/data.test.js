import nock from 'nock';
import fns from 'date-fns';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';
import {contactBuilder} from './mocks/contactBuilder.js';
import {companyBuilder} from './mocks/companyBuilder.js';
import {conversationBuilder} from './mocks/conversationBuilder.js';
import {dataAttributeBuilder} from './mocks/dataAttributeBuilder.js';
import {buildConversationPart} from './mocks/conversationPartBuilder.js';

const timestampToISO = (dt) => (dt ? new Date(dt * 1000).toISOString() : dt);
const formatTimestamp = (timestamp, format = 'dd-MMM-yyyy') =>
    fns.format(timestamp * 1000, format);

describe(`POST /`, () => {
    const account = {
        token: 'data_token',
        intercomAppId: 'intercomAppId',
    };
    const intercom = nock(`https://api.intercom.io`, {
        reqheaders: {
            Authorization: `Bearer ${account.token}`,
        },
    });
    let app;
    let restClient;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    describe(`contacts`, () => {
        it(`retrieve all contacts`, async () => {
            const attrModel = 'contact';
            const customAttr = dataAttributeBuilder({
                overrides: {
                    name: 'custom_attributes.prop',
                    data_type: 'boolean',
                },
                traits: [attrModel, 'custom'],
            });

            const query = {
                operator: 'AND',
                value: [
                    {
                        field: 'role',
                        operator: 'IN',
                        value: [],
                    },
                    {
                        field: 'updated_at',
                        operator: '>',
                        value: 0,
                    },
                ],
            };

            const contact1 = contactBuilder({
                overrides: {custom_attributes: {prop: true}},
            });
            const contact2 = contactBuilder({
                overrides: {custom_attributes: {prop: false}},
            });
            const contact3 = contactBuilder({
                overrides: {custom_attributes: {prop: true}},
            });

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [customAttr],
                });

            intercom
                .post(`/contacts/search`, {
                    query,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact1, contact2],
                    total_count: 3,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 2,
                        total_pages: 2,
                        next: {
                            starting_after: contact2.id,
                        },
                    },
                })
                .post(`/contacts/search`, {
                    query,
                    pagination: {per_page: 100, starting_after: contact2.id},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact3],
                    total_count: 3,
                    pages: {
                        type: 'pages',
                        page: 2,
                        per_page: 1,
                        total_pages: 2,
                    },
                });

            const res = await restClient.getData({
                account,
                source: 'contacts',
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([
                {
                    id: contact1.id,
                    name: contact1.name,
                    external_id: contact1.external_id,
                    owner_id: contact1.owner_id,
                    companiesIds: [],
                    tagsIds: [],
                    created_at: timestampToISO(contact1.created_at),

                    email: contact1.email,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact1.id}`,
                    'location.country': contact1.location.country,
                    'location.region': contact1.location.region,
                    'location.city': contact1.location.city,
                    phone: contact1.phone,
                    signed_up_at: timestampToISO(contact1.signed_up_at),
                    last_seen_at: timestampToISO(contact1.last_seen_at),
                    last_contacted_at: timestampToISO(
                        contact1.last_contacted_at,
                    ),
                    last_replied_at: timestampToISO(contact1.last_replied_at),
                    last_email_opened_at: timestampToISO(
                        contact1.last_email_opened_at,
                    ),
                    last_email_clicked_at: timestampToISO(
                        contact1.last_email_clicked_at,
                    ),
                    browser_language: contact1.browser_language,
                    language_override: contact1.language_override,
                    browser: contact1.browser,
                    browser_version: contact1.browser_version,
                    os: contact1.os,
                    unsubscribed_from_emails: contact1.unsubscribed_from_emails,
                    marked_email_as_spam: contact1.marked_email_as_spam,
                    has_hard_bounced: contact1.has_hard_bounced,
                    role: contact1.role,
                    'custom_attributes.prop': contact1.custom_attributes.prop,
                    __syncAction: 'SET',
                },
                {
                    id: contact2.id,
                    name: contact2.name,
                    external_id: contact2.external_id,
                    owner_id: contact2.owner_id,
                    companiesIds: [],
                    tagsIds: [],
                    created_at: timestampToISO(contact2.created_at),
                    email: contact2.email,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact2.id}`,
                    'location.country': contact2.location.country,
                    'location.region': contact2.location.region,
                    'location.city': contact2.location.city,
                    phone: contact2.phone,
                    signed_up_at: timestampToISO(contact2.signed_up_at),
                    last_seen_at: timestampToISO(contact2.last_seen_at),
                    last_contacted_at: timestampToISO(
                        contact2.last_contacted_at,
                    ),
                    last_replied_at: timestampToISO(contact2.last_replied_at),
                    last_email_opened_at: timestampToISO(
                        contact2.last_email_opened_at,
                    ),
                    last_email_clicked_at: timestampToISO(
                        contact2.last_email_clicked_at,
                    ),
                    browser_language: contact2.browser_language,
                    language_override: contact2.language_override,
                    browser: contact2.browser,
                    browser_version: contact2.browser_version,
                    os: contact2.os,
                    unsubscribed_from_emails: contact2.unsubscribed_from_emails,
                    marked_email_as_spam: contact2.marked_email_as_spam,
                    has_hard_bounced: contact2.has_hard_bounced,
                    role: contact2.role,
                    'custom_attributes.prop': contact2.custom_attributes.prop,
                    __syncAction: 'SET',
                },
                {
                    id: contact3.id,
                    name: contact3.name,
                    external_id: contact3.external_id,
                    owner_id: contact3.owner_id,
                    companiesIds: [],
                    tagsIds: [],
                    created_at: timestampToISO(contact3.created_at),
                    email: contact3.email,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact3.id}`,
                    'location.country': contact3.location.country,
                    'location.region': contact3.location.region,
                    'location.city': contact3.location.city,
                    phone: contact3.phone,
                    signed_up_at: timestampToISO(contact3.signed_up_at),
                    last_seen_at: timestampToISO(contact3.last_seen_at),
                    last_contacted_at: timestampToISO(
                        contact3.last_contacted_at,
                    ),
                    last_replied_at: timestampToISO(contact3.last_replied_at),
                    last_email_opened_at: timestampToISO(
                        contact3.last_email_opened_at,
                    ),
                    last_email_clicked_at: timestampToISO(
                        contact3.last_email_clicked_at,
                    ),
                    browser_language: contact3.browser_language,
                    language_override: contact3.language_override,
                    browser: contact3.browser,
                    browser_version: contact3.browser_version,
                    os: contact3.os,
                    unsubscribed_from_emails: contact3.unsubscribed_from_emails,
                    marked_email_as_spam: contact3.marked_email_as_spam,
                    has_hard_bounced: contact3.has_hard_bounced,
                    role: contact3.role,
                    'custom_attributes.prop': contact3.custom_attributes.prop,
                    __syncAction: 'SET',
                },
            ]);
        });
    });

    describe(`companies`, () => {
        it(`retrieve all companies by scroll param`, async () => {
            const attrModel = 'company';
            const customAttr = dataAttributeBuilder({
                overrides: {name: 'custom_attributes.prop', data_type: 'float'},
                traits: [attrModel, 'custom'],
            });
            const company1 = companyBuilder({
                overrides: {custom_attributes: {prop: 2.34}},
            });
            const company2 = companyBuilder({
                overrides: {custom_attributes: {prop: 3.21}},
            });
            const scrollParam = 'nextPage';

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [customAttr],
                });

            intercom
                .get(`/companies/scroll`)
                .reply(200, {
                    type: 'list',
                    data: [company1],
                    scroll_param: scrollParam,
                })
                .get(`/companies/scroll?scroll_param=${scrollParam}`)
                .reply(200, {
                    type: 'list',
                    data: [company2],
                    scroll_param: scrollParam,
                })
                .get(`/companies/scroll?scroll_param=${scrollParam}`)
                .reply(200, {
                    type: 'list',
                    data: [],
                    scroll_param: scrollParam,
                });

            const res = await restClient.getData({
                account,
                source: 'companies',
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([
                {
                    id: company1.id,
                    name: company1.name,
                    tagsIds: [],
                    user_count: company1.user_count,
                    monthly_spend: company1.monthly_spend,
                    website: company1.website,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company1.id}`,
                    last_request_at: timestampToISO(company1.last_request_at),
                    created_at: timestampToISO(company1.created_at),
                    session_count: company1.session_count,
                    'plan.name': company1.plan.name,
                    size: company1.size,
                    industry: company1.industry,
                    company_id: company1.company_id,
                    remote_created_at: timestampToISO(
                        company1.remote_created_at,
                    ),
                    updated_at: timestampToISO(company1.updated_at),
                    'custom_attributes.prop': company1.custom_attributes.prop,
                    __syncAction: 'SET',
                },
                {
                    id: company2.id,
                    name: company2.name,
                    tagsIds: [],
                    user_count: company2.user_count,
                    monthly_spend: company2.monthly_spend,
                    website: company2.website,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company2.id}`,
                    last_request_at: timestampToISO(company2.last_request_at),
                    created_at: timestampToISO(company2.created_at),
                    session_count: company2.session_count,
                    'plan.name': company2.plan.name,
                    size: company2.size,
                    industry: company2.industry,
                    company_id: company2.company_id,
                    remote_created_at: timestampToISO(
                        company2.remote_created_at,
                    ),
                    updated_at: timestampToISO(company2.updated_at),
                    'custom_attributes.prop': company2.custom_attributes.prop,
                    __syncAction: 'SET',
                },
            ]);
        });
    });

    describe(`conversations`, () => {
        it(`retrieve conversations`, async () => {
            const expectedQuery = {
                field: 'updated_at',
                operator: '>',
                value: 0,
            };
            const conversation1 = conversationBuilder();
            const conversationPart1 = buildConversationPart(1);

            const conversation2 = conversationBuilder();
            const conversationPart2 = buildConversationPart(2, {
                attachments: [
                    {url: 'https://image.com/path/to/img?expires=1624654017'},
                ],
                author: {name: null},
            });

            intercom
                .post(`/conversations/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'conversation.list',
                    conversations: [conversation1],
                    total_count: 2,
                    pages: {
                        type: 'pages',
                        next: {
                            page: 2,
                            starting_after: conversation1.id,
                        },
                        page: 1,
                        per_page: 1,
                        total_pages: 2,
                    },
                })
                .get(`/conversations/${conversation1.id}`)
                .reply(200, {
                    type: 'conversation',
                    ...conversation1,
                    conversation_parts: {
                        type: 'conversation_part.list',
                        conversation_parts: [conversationPart1],
                    },
                })
                .post(`/conversations/search`, {
                    query: expectedQuery,
                    pagination: {
                        per_page: 100,
                        starting_after: conversation1.id,
                    },
                })
                .reply(200, {
                    type: 'conversation.list',
                    conversations: [conversation2],
                    total_count: 2,
                    pages: {
                        type: 'pages',
                        page: 2,
                        per_page: 1,
                        total_pages: 2,
                    },
                })
                .get(`/conversations/${conversation2.id}`)
                .reply(200, {
                    type: 'conversation',
                    ...conversation2,
                    conversation_parts: {
                        type: 'conversation_part.list',
                        conversation_parts: [conversationPart2],
                    },
                });

            const res = await restClient.getData({
                account,
                source: 'conversations',
            });

            expect(res.statusCode).toEqual(200);

            expect(res.body).toEqual([
                {
                    id: conversation1.id,
                    name: `${
                        conversation1.source.author.name
                    } ${formatTimestamp(conversation1.created_at)}`,
                    created_at: timestampToISO(conversation1.created_at),
                    updated_at: timestampToISO(conversation1.updated_at),
                    state: conversation1.state,
                    read: conversation1.read,
                    priority: conversation1.priority === 'priority',
                    tagsIds: [],
                    contactsIds: conversation1.contacts.contacts.map(
                        ({id}) => id,
                    ),
                    teammatesIds: conversation1.teammates.admins.map(
                        ({id}) => id,
                    ),
                    'source.delivered_as': conversation1.source.delivered_as,
                    'source.subject': conversation1.source.subject,
                    'source.body': [
                        `<p><b>${conversation1.source.author.name}:</b></p>${conversation1.source.body}`,
                        `<p><b>Author 1:</b></p>reply 1`,
                    ],
                    'source.author.name': conversation1.source.author.name,
                    'source.author.email': conversation1.source.author.email,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation1.id}`,
                    'first_contact_reply.url':
                        conversation1.first_contact_reply.url,
                    'sla_applied.sla_name': conversation1.sla_applied.sla_name,
                    'sla_applied.sla_status':
                        conversation1.sla_applied.sla_status,
                    'statistics.first_contact_reply_at': timestampToISO(
                        conversation1.statistics.first_contact_reply_at,
                    ),
                    'statistics.first_admin_reply_at': timestampToISO(
                        conversation1.statistics.first_admin_reply_at,
                    ),
                    'statistics.last_contact_reply_at': timestampToISO(
                        conversation1.statistics.last_contact_reply_at,
                    ),
                    'statistics.last_admin_reply_at': timestampToISO(
                        conversation1.statistics.last_admin_reply_at,
                    ),
                    files: [],
                    __syncAction: 'SET',
                },
                {
                    id: conversation2.id,
                    name: `${
                        conversation2.source.author.name
                    } ${formatTimestamp(conversation2.created_at)}`,
                    tagsIds: [],
                    created_at: timestampToISO(conversation2.created_at),
                    updated_at: timestampToISO(conversation2.updated_at),
                    state: conversation2.state,
                    read: conversation2.read,
                    priority: conversation2.priority === 'priority',
                    contactsIds: conversation2.contacts.contacts.map(
                        ({id}) => id,
                    ),
                    teammatesIds: conversation2.teammates.admins.map(
                        ({id}) => id,
                    ),
                    'source.delivered_as': conversation2.source.delivered_as,
                    'source.subject': conversation2.source.subject,
                    'source.body': [
                        `<p><b>${conversation2.source.author.name}:</b></p>${conversation2.source.body}`,
                        `<p><b>Unknown:</b></p>reply 2`,
                    ],
                    'source.author.name': conversation2.source.author.name,
                    'source.author.email': conversation2.source.author.email,
                    intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation2.id}`,
                    'first_contact_reply.url':
                        conversation2.first_contact_reply.url,
                    'sla_applied.sla_name': conversation2.sla_applied.sla_name,
                    'sla_applied.sla_status':
                        conversation2.sla_applied.sla_status,
                    'statistics.first_contact_reply_at': timestampToISO(
                        conversation2.statistics.first_contact_reply_at,
                    ),
                    'statistics.first_admin_reply_at': timestampToISO(
                        conversation2.statistics.first_admin_reply_at,
                    ),
                    'statistics.last_contact_reply_at': timestampToISO(
                        conversation2.statistics.last_contact_reply_at,
                    ),
                    'statistics.last_admin_reply_at': timestampToISO(
                        conversation2.statistics.last_admin_reply_at,
                    ),
                    files: [
                        `app://resource?id=${conversation2.id}&pathname=%2Fpath%2Fto%2Fimg&partId=2`,
                    ],
                    __syncAction: 'SET',
                },
            ]);
        });
    });

    it(`should return 400 for unknown source`, async () => {
        const resWithUnknownField = await restClient.getData({
            source: 'unknown',
            account,
        });

        expect(resWithUnknownField.statusCode).toEqual(400);
    });

    it(`should return 401 as stream error`, async () => {
        nock(`https://api.intercom.io`)
            .post(`/conversations/search`)
            .reply(401, {
                type: 'error.list',
                request_id: 'request_id',
                errors: [{code: 'token_unauthorized', message: 'Unauthorized'}],
            });

        const res = await restClient.getData({
            account,
            source: 'conversations',
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([
            {__streamError: {code: 401, message: 'Unauthorized'}},
        ]);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

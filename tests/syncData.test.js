import nock from 'nock';
import fns from 'date-fns';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';
import {contactBuilder} from './mocks/contactBuilder.js';
import {companyBuilder} from './mocks/companyBuilder.js';
import {conversationBuilder} from './mocks/conversationBuilder.js';
import {dataAttributeBuilder} from './mocks/dataAttributeBuilder.js';
import {tagBuilder} from './mocks/tagBuilder.js';
import {adminBuilder} from './mocks/adminBuilder.js';
import {buildConversationPart} from './mocks/conversationPartBuilder.js';

const timestampToISO = (dt) => (dt ? new Date(dt * 1000).toISOString() : dt);
const formatTimestamp = (timestamp, format = 'dd-MMM-yyyy') =>
    fns.format(timestamp * 1000, format);

describe(`POST /api/v1/synchronizer/data`, () => {
    const account = {
        accountId: 'accId',
        token: 'syncData_token',
        intercomAppId: 'intercomAppId',
    };
    const intercom = nock(`https://api.intercom.io`, {
        reqheaders: {
            Authorization: `Bearer ${account.token}`,
        },
    });
    let restClient;
    let app;

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    afterEach(async () => {
        await app.flushCache();
    });

    describe(`contacts`, () => {
        const attrModel = 'contact';
        it(`retrieve all contacts`, async () => {
            const customAttr = dataAttributeBuilder({
                overrides: {
                    name: 'custom_attributes.prop',
                    data_type: 'boolean',
                },
                traits: [attrModel, 'custom'],
            });

            const expectedQuery = {
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
                .times(2)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [customAttr],
                });

            intercom
                .post(`/contacts/search`, {
                    query: expectedQuery,
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
                    query: expectedQuery,
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

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
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
                        last_replied_at: timestampToISO(
                            contact1.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact1.unsubscribed_from_emails,
                        marked_email_as_spam: contact1.marked_email_as_spam,
                        has_hard_bounced: contact1.has_hard_bounced,
                        role: contact1.role,
                        'custom_attributes.prop':
                            contact1.custom_attributes.prop,
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
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact2.id}`,
                        email: contact2.email,
                        'location.country': contact2.location.country,
                        'location.region': contact2.location.region,
                        'location.city': contact2.location.city,
                        phone: contact2.phone,
                        signed_up_at: timestampToISO(contact2.signed_up_at),
                        last_seen_at: timestampToISO(contact2.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact2.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact2.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact2.unsubscribed_from_emails,
                        marked_email_as_spam: contact2.marked_email_as_spam,
                        has_hard_bounced: contact2.has_hard_bounced,
                        role: contact2.role,
                        'custom_attributes.prop':
                            contact2.custom_attributes.prop,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: true,
                    nextPageConfig: {starting_after: contact2.id},
                },
                synchronizationType: 'full',
            });
            const res2 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
                pagination: res1.body.pagination.nextPageConfig,
            });

            expect(res2.statusCode).toEqual(200);
            expect(res2.body).toEqual({
                items: [
                    {
                        id: contact3.id,
                        name: contact3.name,
                        external_id: contact3.external_id,
                        owner_id: contact3.owner_id,
                        companiesIds: [],
                        tagsIds: [],
                        created_at: timestampToISO(contact3.created_at),
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact3.id}`,
                        email: contact3.email,
                        'location.country': contact3.location.country,
                        'location.region': contact3.location.region,
                        'location.city': contact3.location.city,
                        phone: contact3.phone,
                        signed_up_at: timestampToISO(contact3.signed_up_at),
                        last_seen_at: timestampToISO(contact3.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact3.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact3.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact3.unsubscribed_from_emails,
                        marked_email_as_spam: contact3.marked_email_as_spam,
                        has_hard_bounced: contact3.has_hard_bounced,
                        role: contact3.role,
                        'custom_attributes.prop':
                            contact3.custom_attributes.prop,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });

        it(`fitler contacts by role`, async () => {
            const filter = {
                role: ['lead'],
            };

            const expectedQuery = {
                operator: 'AND',
                value: [
                    {
                        field: 'role',
                        operator: 'IN',
                        value: filter.role,
                    },
                    {
                        field: 'updated_at',
                        operator: '>',
                        value: 0,
                    },
                ],
            };

            const contact1 = contactBuilder();

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            intercom
                .post(`/contacts/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
                    },
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
                filter,
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: contact1.id,
                        name: contact1.name,
                        external_id: contact1.external_id,
                        owner_id: contact1.owner_id,
                        companiesIds: [],
                        tagsIds: [],
                        created_at: timestampToISO(contact1.created_at),
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact1.id}`,
                        email: contact1.email,
                        'location.country': contact1.location.country,
                        'location.region': contact1.location.region,
                        'location.city': contact1.location.city,
                        phone: contact1.phone,
                        signed_up_at: timestampToISO(contact1.signed_up_at),
                        last_seen_at: timestampToISO(contact1.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact1.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact1.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact1.unsubscribed_from_emails,
                        marked_email_as_spam: contact1.marked_email_as_spam,
                        has_hard_bounced: contact1.has_hard_bounced,
                        role: contact1.role,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });

        it(`filter contacts by datebox`, async () => {
            const filter = {
                updated_at: '2020-01-25T12:18:40.727Z',
            };

            const expectedQuery = {
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
                        value: 1579954720,
                    },
                ],
            };

            const contact1 = contactBuilder();

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            intercom
                .post(`/contacts/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
                    },
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
                filter,
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: contact1.id,
                        name: contact1.name,
                        external_id: contact1.external_id,
                        owner_id: contact1.owner_id,
                        companiesIds: [],
                        tagsIds: [],
                        created_at: timestampToISO(contact1.created_at),
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact1.id}`,
                        email: contact1.email,
                        'location.country': contact1.location.country,
                        'location.region': contact1.location.region,
                        'location.city': contact1.location.city,
                        phone: contact1.phone,
                        signed_up_at: timestampToISO(contact1.signed_up_at),
                        last_seen_at: timestampToISO(contact1.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact1.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact1.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact1.unsubscribed_from_emails,
                        marked_email_as_spam: contact1.marked_email_as_spam,
                        has_hard_bounced: contact1.has_hard_bounced,
                        role: contact1.role,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });

        it(`should support delta sync for contacts with 6-hour window`, async () => {
            const expectedQuery = {
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
                        value: 1579933120,
                    },
                ],
            };

            const contact1 = contactBuilder();

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            intercom
                .post(`/contacts/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
                    },
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
                lastSynchronizedAt: '2020-01-25T12:18:40.727Z',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: contact1.id,
                        name: contact1.name,
                        external_id: contact1.external_id,
                        owner_id: contact1.owner_id,
                        companiesIds: [],
                        tagsIds: [],
                        created_at: timestampToISO(contact1.created_at),
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact1.id}`,
                        email: contact1.email,
                        'location.country': contact1.location.country,
                        'location.region': contact1.location.region,
                        'location.city': contact1.location.city,
                        phone: contact1.phone,
                        signed_up_at: timestampToISO(contact1.signed_up_at),
                        last_seen_at: timestampToISO(contact1.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact1.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact1.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact1.unsubscribed_from_emails,
                        marked_email_as_spam: contact1.marked_email_as_spam,
                        has_hard_bounced: contact1.has_hard_bounced,
                        role: contact1.role,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'delta',
            });
        });

        it(`fetch additional data (companies, tags) for contact when there are more`, async () => {
            const expectedQuery = {
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

            const company1 = companyBuilder();
            const company2 = companyBuilder();

            const tag1 = tagBuilder(1);
            const tag2 = tagBuilder(2);

            const contact1 = contactBuilder({
                overrides: {
                    companies: {
                        type: 'list',
                        data: [
                            {
                                id: company1.id,
                                type: 'company',
                                url: `companies/${company1.id}`,
                            },
                        ],
                        url: '',
                        total_count: 2,
                        has_more: true,
                    },
                    tags: {
                        type: 'list',
                        data: [
                            {
                                id: tag1.id,
                                type: 'tag',
                                url: `tags/${tag1.id}`,
                            },
                        ],
                        total_count: 2,
                        has_more: true,
                    },
                },
            });

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            intercom
                .post(`/contacts/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'list',
                    data: [contact1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
                    },
                });

            intercom
                .get(`/contacts/${contact1.id}/companies?per_page=50&page=1`)
                .reply(200, {
                    type: 'list',
                    data: [company1],
                    pages: {
                        type: 'pages',
                        next: `https://api.intercom.io/contacts/${contact1.id}/companies?page=2&per_page=50`,
                        page: 1,
                        per_page: 1,
                        total_pages: 2,
                    },
                    total_count: 2,
                })
                .get(`/contacts/${contact1.id}/companies?per_page=50&page=2`)
                .reply(200, {
                    type: 'list',
                    data: [company2],
                    pages: {
                        type: 'pages',
                        next: null,
                        page: 2,
                        per_page: 1,
                        total_pages: 2,
                    },
                    total_count: 2,
                });

            intercom.get(`/contacts/${contact1.id}/tags`).reply(200, {
                type: 'list',
                data: [tag1, tag2],
            });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'contacts',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: contact1.id,
                        name: contact1.name,
                        external_id: contact1.external_id,
                        owner_id: contact1.owner_id,
                        companiesIds: [company1.id, company2.id],
                        tagsIds: [tag1.id, tag2.id],
                        created_at: timestampToISO(contact1.created_at),
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contact1.id}`,
                        email: contact1.email,
                        'location.country': contact1.location.country,
                        'location.region': contact1.location.region,
                        'location.city': contact1.location.city,
                        phone: contact1.phone,
                        signed_up_at: timestampToISO(contact1.signed_up_at),
                        last_seen_at: timestampToISO(contact1.last_seen_at),
                        last_contacted_at: timestampToISO(
                            contact1.last_contacted_at,
                        ),
                        last_replied_at: timestampToISO(
                            contact1.last_replied_at,
                        ),
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
                        unsubscribed_from_emails:
                            contact1.unsubscribed_from_emails,
                        marked_email_as_spam: contact1.marked_email_as_spam,
                        has_hard_bounced: contact1.has_hard_bounced,
                        role: contact1.role,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });
    });

    describe(`companies`, () => {
        const attrModel = 'company';
        it(`retrieve all companies by scroll param`, async () => {
            const createdAtAttr = dataAttributeBuilder({
                overrides: {name: 'created_at', data_type: 'date'},
                traits: attrModel,
            });
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
                .times(3)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [createdAtAttr, customAttr],
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

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'companies',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: company1.id,
                        name: company1.name,
                        tagsIds: [],
                        user_count: company1.user_count,
                        monthly_spend: company1.monthly_spend,
                        website: company1.website,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company1.id}`,
                        last_request_at: timestampToISO(
                            company1.last_request_at,
                        ),
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
                        'custom_attributes.prop':
                            company1.custom_attributes.prop,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {hasNext: true, nextPageConfig: {scrollParam}},
                synchronizationType: 'full',
            });

            const res2 = await restClient.getSyncData({
                account,
                requestedType: 'companies',
                pagination: res1.body.pagination.nextPageConfig,
            });

            expect(res2.statusCode).toEqual(200);
            expect(res2.body).toEqual({
                items: [
                    {
                        id: company2.id,
                        name: company2.name,
                        tagsIds: [],
                        user_count: company2.user_count,
                        monthly_spend: company2.monthly_spend,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company2.id}`,
                        website: company2.website,
                        last_request_at: timestampToISO(
                            company2.last_request_at,
                        ),
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
                        'custom_attributes.prop':
                            company2.custom_attributes.prop,
                        __syncAction: 'SET',
                    },
                ],
                pagination: {hasNext: true, nextPageConfig: {scrollParam}},
                synchronizationType: 'full',
            });

            const res3 = await restClient.getSyncData({
                account,
                requestedType: 'companies',
                pagination: res1.body.pagination.nextPageConfig,
            });

            expect(res3.statusCode).toEqual(200);
            expect(res3.body).toEqual({
                items: [],
                pagination: {hasNext: false, nextPageConfig: {scrollParam}},
                synchronizationType: 'full',
            });
        });

        it(`filter companies by datebox`, async () => {
            const filter = {
                updated_at: '2020-09-25T12:18:40.727Z',
            };

            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            const company1 = companyBuilder({
                overrides: {updated_at: 1579854720},
            });
            const company2 = companyBuilder({
                overrides: {updated_at: 1591036320},
            });
            const company3 = companyBuilder({
                overrides: {updated_at: 1631036320},
            });
            const scrollParam = 'nextPage';

            intercom.get(`/companies/scroll`).reply(200, {
                type: 'list',
                data: [company1, company2, company3],
                scroll_param: scrollParam,
            });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'companies',
                filter,
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: company3.id,
                        name: company3.name,
                        tagsIds: [],
                        user_count: company3.user_count,
                        monthly_spend: company3.monthly_spend,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company3.id}`,
                        website: company3.website,
                        last_request_at: timestampToISO(
                            company3.last_request_at,
                        ),
                        created_at: timestampToISO(company3.created_at),
                        session_count: company3.session_count,
                        'plan.name': company3.plan.name,
                        size: company3.size,
                        industry: company3.industry,
                        company_id: company3.company_id,
                        remote_created_at: timestampToISO(
                            company3.remote_created_at,
                        ),
                        updated_at: timestampToISO(company3.updated_at),
                        __syncAction: 'SET',
                    },
                ],
                pagination: {hasNext: true, nextPageConfig: {scrollParam}},
                synchronizationType: 'full',
            });
        });

        it(`support delta sync for companies with 6-hour window`, async () => {
            intercom
                .get(`/data_attributes`)
                .query({model: attrModel})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            const company1 = companyBuilder({
                overrides: {updated_at: 1579854720},
            });
            const company2 = companyBuilder({
                overrides: {updated_at: 1591036320},
            });
            const company3 = companyBuilder({
                overrides: {updated_at: 1631036320},
            });
            const scrollParam = 'nextPage';

            intercom.get(`/companies/scroll`).reply(200, {
                type: 'list',
                data: [company1, company2, company3],
                scroll_param: scrollParam,
            });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'companies',
                lastSynchronizedAt: '2020-09-25T12:18:40.727Z',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
                    {
                        id: company3.id,
                        name: company3.name,
                        tagsIds: [],
                        user_count: company3.user_count,
                        monthly_spend: company3.monthly_spend,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${company3.id}`,
                        website: company3.website,
                        last_request_at: timestampToISO(
                            company3.last_request_at,
                        ),
                        created_at: timestampToISO(company3.created_at),
                        session_count: company3.session_count,
                        'plan.name': company3.plan.name,
                        size: company3.size,
                        industry: company3.industry,
                        company_id: company3.company_id,
                        remote_created_at: timestampToISO(
                            company3.remote_created_at,
                        ),
                        updated_at: timestampToISO(company3.updated_at),
                        __syncAction: 'SET',
                    },
                ],
                pagination: {hasNext: true, nextPageConfig: {scrollParam}},
                synchronizationType: 'delta',
            });
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

            const conversation2 = conversationBuilder({
                map: (conversation) => {
                    conversation.source.author.name = null;
                    return conversation;
                },
            });
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

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'conversations',
            });

            expect(res1.statusCode).toEqual(200);

            expect(res1.body).toEqual({
                items: [
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
                        'source.delivered_as':
                            conversation1.source.delivered_as,
                        'source.subject': conversation1.source.subject,
                        'source.body': [
                            `<p><b>${conversation1.source.author.name}:</b></p>${conversation1.source.body}`,
                            `<p><b>Author 1:</b></p>reply 1`,
                        ],
                        'source.author.name': conversation1.source.author.name,
                        'source.author.email':
                            conversation1.source.author.email,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation1.id}`,
                        'first_contact_reply.url':
                            conversation1.first_contact_reply.url,
                        'sla_applied.sla_name':
                            conversation1.sla_applied.sla_name,
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
                ],
                pagination: {
                    hasNext: true,
                    nextPageConfig: {
                        page: 2,
                        starting_after: conversation1.id,
                    },
                },
                synchronizationType: 'full',
            });

            const res2 = await restClient.getSyncData({
                account,
                requestedType: 'conversations',
                pagination: res1.body.pagination.nextPageConfig,
            });

            expect(res2.statusCode).toEqual(200);

            expect(res2.body).toEqual({
                items: [
                    {
                        id: conversation2.id,
                        name: `Unknown ${formatTimestamp(
                            conversation2.created_at,
                        )}`,
                        created_at: timestampToISO(conversation2.created_at),
                        updated_at: timestampToISO(conversation2.updated_at),
                        state: conversation2.state,
                        read: conversation2.read,
                        priority: conversation2.priority === 'priority',
                        tagsIds: [],
                        contactsIds: conversation2.contacts.contacts.map(
                            ({id}) => id,
                        ),
                        teammatesIds: conversation2.teammates.admins.map(
                            ({id}) => id,
                        ),
                        'source.delivered_as':
                            conversation2.source.delivered_as,
                        'source.subject': conversation2.source.subject,
                        'source.body': [
                            `<p><b>Unknown:</b></p>${conversation2.source.body}`,
                            `<p><b>Unknown:</b></p>reply 2`,
                        ],
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation2.id}`,
                        'source.author.name': conversation2.source.author.name,
                        'source.author.email':
                            conversation2.source.author.email,
                        'first_contact_reply.url':
                            conversation2.first_contact_reply.url,
                        'sla_applied.sla_name':
                            conversation2.sla_applied.sla_name,
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
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });

        it(`filter conversations by datebox`, async () => {
            const filter = {
                updated_at: '2020-01-25T12:18:40.727Z',
            };

            const expectedQuery = {
                field: 'updated_at',
                operator: '>',
                value: 1579954720,
            };

            const conversation1 = conversationBuilder();
            const conversationPart1 = buildConversationPart(1);

            intercom
                .post(`/conversations/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'conversation.list',
                    conversations: [conversation1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
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
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'conversations',
                filter,
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
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
                        'source.delivered_as':
                            conversation1.source.delivered_as,
                        'source.subject': conversation1.source.subject,
                        'source.body': [
                            `<p><b>${conversation1.source.author.name}:</b></p>${conversation1.source.body}`,
                            `<p><b>Author 1:</b></p>reply 1`,
                        ],
                        'source.author.name': conversation1.source.author.name,
                        'source.author.email':
                            conversation1.source.author.email,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation1.id}`,
                        'first_contact_reply.url':
                            conversation1.first_contact_reply.url,
                        'sla_applied.sla_name':
                            conversation1.sla_applied.sla_name,
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
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });

        it(`support delta sync for conversations with 6 hour window`, async () => {
            const expectedQuery = {
                field: 'updated_at',
                operator: '>',
                value: 1579933120,
            };

            const conversation1 = conversationBuilder();
            const conversationPart1 = buildConversationPart(1);

            intercom
                .post(`/conversations/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'conversation.list',
                    conversations: [conversation1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
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
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'conversations',
                lastSynchronizedAt: '2020-01-25T12:18:40.727Z',
            });

            expect(res1.statusCode).toEqual(200);
            expect(res1.body).toEqual({
                items: [
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
                        'source.delivered_as':
                            conversation1.source.delivered_as,
                        'source.subject': conversation1.source.subject,
                        'source.body': [
                            `<p><b>${conversation1.source.author.name}:</b></p>${conversation1.source.body}`,
                            `<p><b>Author 1:</b></p>reply 1`,
                        ],
                        'source.author.name': conversation1.source.author.name,
                        'source.author.email':
                            conversation1.source.author.email,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation1.id}`,
                        'first_contact_reply.url':
                            conversation1.first_contact_reply.url,
                        'sla_applied.sla_name':
                            conversation1.sla_applied.sla_name,
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
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'delta',
            });
        });

        it(`should replace img src inside messages`, async () => {
            const expectedQuery = {
                field: 'updated_at',
                operator: '>',
                value: 0,
            };

            const msgBody = `<div class="intercom-container"><img src="https://downloads.intercomcdn.com/i/o/344227860/2c0e66292ea1c96ccbe14cfa/Screen+Shot+2021-05-31+at+17.39.49.png?expires=1624654017&amp;signature=47f2aab47d606ea1dd2b0e98a80a56ff2153a36b7d11b6eb9ecd200aeeb6255c"/></div>`;
            const part1Msg = `<div class="intercom-container"><img src="https://downloads.intercomcdn.com/i/o/123/acsd22/test.png?expires=1624654017&amp;signature=47f2aab47d606ea1dd2b0e98a80a56ff2153a36b7d11b6eb9ecd200aeeb6255c"/></div>`;

            const mockedConversation = conversationBuilder();
            const conversation1 = {
                ...mockedConversation,
                source: {...mockedConversation.source, body: msgBody},
            };

            const conversationPart1 = buildConversationPart(1, {
                body: part1Msg,
            });

            intercom
                .post(`/conversations/search`, {
                    query: expectedQuery,
                    pagination: {per_page: 100},
                })
                .reply(200, {
                    type: 'conversation.list',
                    conversations: [conversation1],
                    total_count: 1,
                    pages: {
                        type: 'pages',
                        page: 1,
                        per_page: 1,
                        total_pages: 1,
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
                });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'conversations',
            });

            expect(res1.statusCode).toEqual(200);

            expect(res1.body).toEqual({
                items: [
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
                        'source.delivered_as':
                            conversation1.source.delivered_as,
                        'source.subject': conversation1.source.subject,
                        'source.body': [
                            `<p><b>${conversation1.source.author.name}:</b></p><div class="intercom-container"><img src="http://127.0.0.1:3700/api/v1/conversation/${conversation1.id}/img?accountId=${account.accountId}"/></div>`,
                            `<p><b>Author 1:</b></p><div class="intercom-container"><img src="http://127.0.0.1:3700/api/v1/conversation/${conversation1.id}/${conversationPart1.id}/img?accountId=${account.accountId}"/></div>`,
                        ],
                        'source.author.name': conversation1.source.author.name,
                        'source.author.email':
                            conversation1.source.author.email,
                        intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${conversation1.id}`,
                        'first_contact_reply.url':
                            conversation1.first_contact_reply.url,
                        'sla_applied.sla_name':
                            conversation1.sla_applied.sla_name,
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
                ],
                pagination: {
                    hasNext: false,
                    nextPageConfig: undefined,
                },
                synchronizationType: 'full',
            });
        });
    });

    describe(`tags`, () => {
        it(`retrieve tags`, async () => {
            const tag1 = tagBuilder(1);
            const tag2 = tagBuilder(2);

            intercom.get(`/tags`).reply(200, {
                type: 'list',
                data: [tag1, tag2],
            });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'tags',
            });

            expect(res1.statusCode).toEqual(200);

            expect(res1.body).toMatchInlineSnapshot(`
                {
                  "items": [
                    {
                      "id": 1,
                      "name": "Tag 1",
                    },
                    {
                      "id": 2,
                      "name": "Tag 2",
                    },
                  ],
                  "pagination": {
                    "hasNext": false,
                  },
                  "synchronizationType": "full",
                }
            `);
        });
    });

    describe(`admins`, () => {
        it(`retrieve admins`, async () => {
            const admin1 = adminBuilder(1);
            const admin2 = adminBuilder(2);

            intercom.get(`/admins`).reply(200, {
                type: 'admin.list',
                admins: [admin1, admin2],
            });

            const res1 = await restClient.getSyncData({
                account,
                requestedType: 'admins',
            });

            expect(res1.statusCode).toEqual(200);

            expect(res1.body).toMatchInlineSnapshot(`
                {
                  "items": [
                    {
                      "away_mode_enabled": false,
                      "away_mode_reassign": false,
                      "email": "admin1@mail.com",
                      "has_inbox_seat": false,
                      "id": 1,
                      "job_title": "Job 1",
                      "name": "Admin 1",
                    },
                    {
                      "away_mode_enabled": false,
                      "away_mode_reassign": false,
                      "email": "admin2@mail.com",
                      "has_inbox_seat": false,
                      "id": 2,
                      "job_title": "Job 2",
                      "name": "Admin 2",
                    },
                  ],
                  "pagination": {
                    "hasNext": false,
                  },
                  "synchronizationType": "full",
                }
            `);
        });
    });

    it(`should return 400 for unknown source`, async () => {
        const resWithUnknownField = await restClient.getSyncData({
            requestedType: 'unknown',
            token: 'token',
        });

        expect(resWithUnknownField.statusCode).toEqual(400);
    });

    afterAll(async () => {
        await app.destroy();
    });
});

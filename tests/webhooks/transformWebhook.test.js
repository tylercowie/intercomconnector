import nock from 'nock';
import fns from 'date-fns';
import {createTestApp} from '../testApp.js';
import {getRestClient} from '../restClient.js';
import {conversationBuilder} from '../mocks/conversationBuilder.js';
import {tagBuilder} from '../mocks/tagBuilder.js';
import {companyBuilder} from '../mocks/companyBuilder.js';
import {contactBuilder} from '../mocks/contactBuilder.js';
import {buildConversationPart} from '../mocks/conversationPartBuilder.js';

const timestampToISO = (dt) => (dt ? new Date(dt * 1000).toISOString() : dt);
const formatTimestamp = (timestamp, format = 'dd-MMM-yyyy') =>
    fns.format(timestamp * 1000, format);

describe(`POST /api/v1/synchronizer/webhooks/transform`, () => {
    const account = {
        token: 'webhooks_transform',
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

    it.each([
        'conversation.user.created',
        'conversation.user.replied',
        'conversation.admin.replied',
        'conversation.admin.single.created',
    ])('should return detailed conversation for: [%s]', async (topic) => {
        const types = ['conversations'];
        const conversation1 = conversationBuilder();
        const conversationPart1 = buildConversationPart(1);

        const payload = {
            app_id: 'app_id',
            topic,
            data: {
                item: {
                    id: conversation1.id,
                },
            },
        };

        intercom.get(`/conversations/${conversation1.id}`).reply(200, {
            type: 'conversation',
            ...conversation1,
            conversation_parts: {
                type: 'conversation_part.list',
                conversation_parts: [conversationPart1],
            },
        });

        const res = await restClient.transformWebhook({
            payload,
            account,
            types,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                conversations: [
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
            },
        });
    });

    it.each([
        ['conversation.admin.closed', 'closed'],
        ['conversation.admin.opened', 'open'],
        ['conversation.admin.snoozed', 'snoozed'],
        ['conversation.admin.unsnoozed', 'open'],
    ])('Should return state delta for: [%s]', async (topic, state) => {
        const conversation1 = conversationBuilder({overrides: {state}});

        const payload = {
            app_id: 'app_id',
            topic,
            data: {
                item: {
                    id: conversation1.id,
                    state: conversation1.state,
                },
            },
        };

        const res = await restClient.transformWebhook({
            payload,
            account,
            types: ['conversations'],
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                conversations: [
                    {
                        id: conversation1.id,
                        state: conversation1.state,
                        __syncAction: 'SET',
                    },
                ],
            },
        });
    });

    it(`should return updated tags in conversations and new ones for depending on provided types: [conversation_part.tag.created]`, async () => {
        const tag1 = tagBuilder(1);
        const tag2 = tagBuilder(2);
        const conversation1 = conversationBuilder({
            overrides: {tags: {tags: [tag1, tag2], type: 'tag.list'}},
        });

        const payload = {
            app_id: 'app_id',
            topic: 'conversation_part.tag.created',
            data: {
                item: {
                    id: conversation1.id,
                    tags: conversation1.tags,
                    tags_added: {
                        tags: [tag2],
                        type: 'tag.list',
                    },
                },
            },
        };

        const resAll = await restClient.transformWebhook({
            payload,
            account,
            types: ['conversations', 'tags'],
        });

        expect(resAll.statusCode).toEqual(200);
        expect(resAll.body).toEqual({
            data: {
                conversations: [
                    {
                        id: conversation1.id,
                        tagsIds: [tag1.id, tag2.id],
                        __syncAction: 'SET',
                    },
                ],
                tags: [
                    {
                        id: tag2.id,
                        name: tag2.name,
                    },
                ],
            },
        });

        const resTags = await restClient.transformWebhook({
            payload,
            account,
            types: ['tags'],
        });

        expect(resTags.statusCode).toEqual(200);
        expect(resTags.body).toEqual({
            data: {
                tags: [
                    {
                        id: tag2.id,
                        name: tag2.name,
                    },
                ],
            },
        });

        const resEmpty = await restClient.transformWebhook({
            payload,
            account,
            types: [],
        });

        expect(resEmpty.statusCode).toEqual(200);
        expect(resEmpty.body).toEqual({
            data: {},
        });
    });

    it(`should return company for: [company.created]`, async () => {
        const types = ['companies'];
        const company1 = companyBuilder();

        const payload = {
            app_id: 'app_id',
            topic: 'company.created',
            data: {
                item: {
                    id: company1.id,
                },
            },
        };

        intercom.get(`/data_attributes`).query({model: 'company'}).reply(200, {
            type: 'list',
            data: [],
        });

        intercom.get(`/companies/${company1.id}`).reply(200, {
            type: 'company',
            ...company1,
        });

        const res = await restClient.transformWebhook({
            payload,
            account,
            types,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                companies: [
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
                        __syncAction: 'SET',
                    },
                ],
            },
        });
    });

    it.each([['user.created'], ['contact.created']])(
        `should return contact for: [%s]`,
        async (topic) => {
            const types = ['contacts'];
            const contact1 = contactBuilder();

            const payload = {
                app_id: 'app_id',
                topic,
                data: {
                    item: {
                        id: contact1.id,
                    },
                },
            };

            intercom
                .get(`/data_attributes`)
                .times(2)
                .query({model: 'contact'})
                .reply(200, {
                    type: 'list',
                    data: [],
                });

            intercom.get(`/contacts/${contact1.id}`).reply(200, {
                type: 'contact',
                ...contact1,
            });

            const res = await restClient.transformWebhook({
                payload,
                account,
                types,
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({
                data: {
                    contacts: [
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
                },
            });

            const company1 = companyBuilder();
            const company2 = companyBuilder();

            const tag1 = tagBuilder(1);
            const tag2 = tagBuilder(2);

            const contactWithMore = contactBuilder({
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

            intercom.get(`/contacts/${contactWithMore.id}`).reply(200, {
                type: 'contact',
                ...contactWithMore,
            });

            intercom
                .get(
                    `/contacts/${contactWithMore.id}/companies?per_page=50&page=1`,
                )
                .reply(200, {
                    type: 'list',
                    data: [company1],
                    pages: {
                        type: 'pages',
                        next: `https://api.intercom.io/contacts/${contactWithMore.id}/companies?page=2&per_page=50`,
                        page: 1,
                        per_page: 1,
                        total_pages: 2,
                    },
                    total_count: 2,
                })
                .get(
                    `/contacts/${contactWithMore.id}/companies?per_page=50&page=2`,
                )
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

            intercom.get(`/contacts/${contactWithMore.id}/tags`).reply(200, {
                type: 'list',
                data: [tag1, tag2],
            });

            const resWithMore = await restClient.transformWebhook({
                payload: {
                    app_id: 'app_id',
                    topic,
                    data: {
                        item: {
                            id: contactWithMore.id,
                        },
                    },
                },
                account,
                types,
            });

            expect(resWithMore.statusCode).toEqual(200);
            expect(resWithMore.body).toEqual({
                data: {
                    contacts: [
                        {
                            id: contactWithMore.id,
                            name: contactWithMore.name,
                            external_id: contactWithMore.external_id,
                            owner_id: contactWithMore.owner_id,
                            companiesIds: [company1.id, company2.id],
                            tagsIds: [tag1.id, tag2.id],
                            created_at: timestampToISO(
                                contactWithMore.created_at,
                            ),
                            intercomLink: `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${contactWithMore.id}`,
                            email: contactWithMore.email,
                            'location.country':
                                contactWithMore.location.country,
                            'location.region': contactWithMore.location.region,
                            'location.city': contactWithMore.location.city,
                            phone: contactWithMore.phone,
                            signed_up_at: timestampToISO(
                                contactWithMore.signed_up_at,
                            ),
                            last_seen_at: timestampToISO(
                                contactWithMore.last_seen_at,
                            ),
                            last_contacted_at: timestampToISO(
                                contactWithMore.last_contacted_at,
                            ),
                            last_replied_at: timestampToISO(
                                contactWithMore.last_replied_at,
                            ),
                            last_email_opened_at: timestampToISO(
                                contactWithMore.last_email_opened_at,
                            ),
                            last_email_clicked_at: timestampToISO(
                                contactWithMore.last_email_clicked_at,
                            ),
                            browser_language: contactWithMore.browser_language,
                            language_override:
                                contactWithMore.language_override,
                            browser: contactWithMore.browser,
                            browser_version: contactWithMore.browser_version,
                            os: contactWithMore.os,
                            unsubscribed_from_emails:
                                contactWithMore.unsubscribed_from_emails,
                            marked_email_as_spam:
                                contactWithMore.marked_email_as_spam,
                            has_hard_bounced: contactWithMore.has_hard_bounced,
                            role: contactWithMore.role,
                            __syncAction: 'SET',
                        },
                    ],
                },
            });
        },
    );

    it.each([
        ['user.tag.created', 'user'],
        ['contact.tag.created', 'contact'],
    ])(`should return contact for tag event: [%s]`, async (topic, key) => {
        const types = ['contacts'];
        const tag1 = tagBuilder(1);
        const contact1 = contactBuilder({
            overrides: {
                tags: {
                    data: [{id: tag1.id}],
                    type: 'list',
                },
            },
        });

        const payload = {
            app_id: 'app_id',
            topic,
            data: {
                item: {
                    tag: tag1,
                    [key]: {
                        id: contact1.id,
                    },
                },
            },
        };

        intercom.get(`/data_attributes`).query({model: 'contact'}).reply(200, {
            type: 'list',
            data: [],
        });

        intercom.get(`/contacts/${contact1.id}`).reply(200, {
            type: 'contact',
            ...contact1,
        });

        const res = await restClient.transformWebhook({
            payload,
            account,
            types,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                contacts: [
                    {
                        id: contact1.id,
                        name: contact1.name,
                        external_id: contact1.external_id,
                        owner_id: contact1.owner_id,
                        companiesIds: [],
                        tagsIds: [tag1.id],
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
            },
        });
    });

    it.each([
        ['contact.tag.deleted', 'contact'],
        ['user.tag.deleted', 'user'],
    ])(`should return tags ids aftere delete for: [%s]`, async (topic, key) => {
        const tag1 = tagBuilder(1);
        const tagDeleted = tagBuilder(2);
        const payload = {
            app_id: 'app_id',
            topic,
            data: {
                item: {
                    tag: tagDeleted,
                    [key]: {
                        id: 'contact-id',
                        tags: {
                            tags: [{id: tag1.id}],
                        },
                    },
                },
            },
        };

        const res = await restClient.transformWebhook({
            payload,
            account,
            types: ['contacts'],
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                contacts: [
                    {
                        id: 'contact-id',
                        tagsIds: [tag1.id],
                        __syncAction: 'SET',
                    },
                ],
            },
        });
    });

    it(`should get remove action for: [user.deleted]`, async () => {
        const payload = {
            app_id: 'app_id',
            topic: 'user.deleted',
            data: {
                item: {
                    id: 'contact-id',
                },
            },
        };

        const res = await restClient.transformWebhook({
            payload,
            account,
            types: ['contacts'],
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                contacts: [
                    {
                        id: 'contact-id',
                        __syncAction: 'REMOVE',
                    },
                ],
            },
        });
    });

    it(`should update email: [user.email.updated]`, async () => {
        const contact1 = contactBuilder();
        const payload = {
            app_id: 'app_id',
            topic: 'user.email.updated',
            data: {
                item: {
                    id: contact1.id,
                    email: contact1.email,
                },
            },
        };

        const res = await restClient.transformWebhook({
            payload,
            account,
            types: ['contacts'],
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            data: {
                contacts: [
                    {
                        id: contact1.id,
                        email: contact1.email,
                        __syncAction: 'SET',
                    },
                ],
            },
        });
    });

    it(`should return empty data object for unknown topic`, async () => {
        const payload = {
            app_id: 'app_id',
            topic: 'unknown.topic',
            data: {
                item: {
                    id: 24,
                },
            },
        };

        const res = await restClient.transformWebhook({
            payload,
            account,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({data: {}});
    });

    afterAll(async () => {
        await app.destroy();
    });
});

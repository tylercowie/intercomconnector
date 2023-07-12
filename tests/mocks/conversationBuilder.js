import {build, bool, oneOf, perBuild} from '@jackfranklin/test-data-bot';
import {fakeTimestamp} from './fakeTimestamp.js';
import {faker} from '@faker-js/faker';

// https://developers.intercom.com/intercom-api-reference/reference#conversation-model
export const conversationBuilder = build({
    fields: {
        type: 'conversation',
        id: perBuild(() => faker.datatype.uuid()),
        created_at: perBuild(fakeTimestamp),
        updated_at: perBuild(fakeTimestamp),
        title: perBuild(() => faker.lorem.word()),
        admin_assignee_id: perBuild(() => faker.datatype.uuid()),
        team_assignee_id: null,
        open: bool(),
        state: oneOf('open', 'closed', 'snoozed'),
        read: bool(),
        waiting_since: perBuild(fakeTimestamp),
        snoozed_until: null,
        priority: oneOf('priority', 'not_priority'),
        contacts: {
            type: 'contact.list',
            contacts: [
                {
                    id: perBuild(() => faker.datatype.uuid()),
                    type: oneOf('user', 'lead'),
                },
            ],
        },
        teammates: {
            type: 'admin.list',
            admins: [],
        },
        source: {
            attachments: [],
            author: {
                id: perBuild(() => faker.datatype.uuid()),
                type: oneOf('user', 'lead'),
                name: 'Author',
            },
            body: perBuild(() => `<p>${faker.lorem.paragraph()}</p>`),
            delivered_as: 'customer_initiated',
            id: perBuild(() => faker.datatype.uuid()),
            subject: '',
            type: oneOf('conversation', 'push', 'facebook', 'twitter', 'email'),
            url: 'https://intercom-survey-app.glitch.me/',
            redacted: bool(),
        },
        tags: {
            tags: [],
            type: 'tag.list',
        },
        first_contact_reply: {
            created_at: perBuild(fakeTimestamp),
            type: oneOf('conversation', 'push', 'facebook', 'twitter', 'email'),
            url: 'https://intercom-survey-app.glitch.me/',
        },
        sla_applied: {
            sla_name: 'VIP customer <5m',
            sla_status: oneOf('hit', 'cancelled', 'missed'),
        },
        conversation_rating: {
            created_at: null,
            contact: {
                id: null,
                type: null,
            },
            rating: null,
            remark: null,
            teammate: {
                id: null,
                type: null,
                name: null,
                email: null,
            },
        },
        statistics: {
            time_to_assignment: perBuild(() => faker.datatype.number()),
            time_to_admin_reply: perBuild(() => faker.datatype.number()),
            time_to_first_close: perBuild(() => faker.datatype.number()),
            time_to_last_close: perBuild(() => faker.datatype.number()),
            median_time_to_reply: perBuild(() => faker.datatype.number()),
            first_contact_reply_at: perBuild(fakeTimestamp),
            first_assignment_at: perBuild(fakeTimestamp),
            first_admin_reply_at: perBuild(fakeTimestamp),
            first_close_at: perBuild(fakeTimestamp),
            last_assignment_at: perBuild(fakeTimestamp),
            last_assignment_admin_reply_at: perBuild(() =>
                faker.date.recent().getTime(),
            ),
            last_contact_reply_at: perBuild(fakeTimestamp),
            last_admin_reply_at: perBuild(fakeTimestamp),
            last_close_at: perBuild(fakeTimestamp),
            last_closed_by: {
                type: 'admin',
                id: perBuild(() => faker.datatype.uuid()),
                name: perBuild(() => faker.name.fullName()),
                email: perBuild(() => faker.internet.email()),
            },
            count_reopens: perBuild(() => faker.datatype.number()),
            count_assignments: perBuild(() => faker.datatype.number()),
            count_conversation_parts: perBuild(() => faker.datatype.number()),
        },
    },
});

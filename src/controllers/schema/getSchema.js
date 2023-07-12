import crypto from 'crypto';
import {listAttributes} from '../../connector/api.js';
import {badRequest} from '../../errors.js';
import {formatTimestamp} from '../data/dateConverters.js';
import {mapType} from './mapType.js';

const getId = ({id}) => id;

// detailed schema for contacts and companies is fetched from intercom
const appSchema = {
    contacts: {
        id: {type: 'id'},
        name: {type: 'text'},
        companiesIds: {
            type: 'array[text]',
            description: 'The companies which the contact belongs to.',
            getValue: (item) => item.companies.data.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Companies',
                targetName: 'Contacts',
                targetType: 'companies',
                targetFieldId: 'id',
            },
        },
        tagsIds: {
            type: 'array[text]',
            description: 'The tags which have been added to the contact.',
            getValue: (item) => item.tags.data.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Tags',
                targetName: 'Contacts',
                targetType: 'tags',
                targetFieldId: 'id',
            },
        },
        email: {type: 'text', subType: 'email'},
        'location.country': {type: 'text'},
        'location.region': {type: 'text'},
        'location.city': {type: 'text'},
        intercomLink: {
            name: 'Intercom Link',
            type: 'text',
            subType: 'url',
            description: 'Link to original conversation',
            getValue: (item, account) =>
                `https://app.intercom.com/a/apps/${account.intercomAppId}/users/${item.id}`,
        },
        owner_id: {type: 'id'},
        external_id: {type: 'id'},
        phone: {type: 'text'},
        created_at: {type: 'date'},
        signed_up_at: {type: 'date'},
        last_seen_at: {type: 'date'},
        last_contacted_at: {type: 'date'},
        last_replied_at: {type: 'date'},
        last_email_opened_at: {type: 'date'},
        last_email_clicked_at: {type: 'date'},
        browser_language: {type: 'text'},
        language_override: {type: 'text'},
        browser: {type: 'text'},
        browser_version: {type: 'text'},
        os: {type: 'text'},
        unsubscribed_from_emails: {type: 'text', subType: 'boolean'},
        marked_email_as_spam: {type: 'text', subType: 'boolean'},
        has_hard_bounced: {type: 'text', subType: 'boolean'},
        role: {type: 'text'},
        __syncAction: {
            type: `text`,
            getValue: () => 'SET',
        },
    },
    conversations: {
        id: {
            type: 'id',
            description: 'The id representing the conversation.',
        },
        name: {
            type: 'text',
            getValue: (item) =>
                `${item.source.author.name || 'Unknown'} ${formatTimestamp(
                    item.created_at,
                )}`,
        },
        'source.body': {
            name: 'Messages',
            type: 'array[text]',
            subType: 'html',
            description:
                'The message body, which may contain HTML. For Twitter, this will show a generic message regarding why the body is obscured.',
            writable: true,
        },
        contactsIds: {
            type: 'array[text]',
            description:
                'The list of contacts (users or leads) involved in this conversation.',
            getValue: (item) => item.contacts.contacts.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Contacts',
                targetName: 'Conversations',
                targetType: 'contacts',
                targetFieldId: 'id',
            },
        },
        teammatesIds: {
            type: 'array[text]',
            description:
                'The list of teammates who participated in the conversation (wrote at least one conversation part).',
            getValue: (item) => item.teammates.admins.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Teammates',
                targetName: 'Conversations',
                targetType: 'admins',
                targetFieldId: 'id',
            },
        },
        tagsIds: {
            type: 'array[text]',
            description: 'A list of tags associated with the conversation.',
            getValue: (item) => item.tags.tags.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Tags',
                targetName: 'Conversations',
                targetType: 'tags',
                targetFieldId: 'id',
            },
        },
        state: {
            name: 'State',
            type: 'text',
            description: 'Can be set to "open", "closed" or "snoozed".',
            important: true,
        },
        'source.author.name': {name: 'Author Name', type: 'text'},
        'source.author.email': {
            name: 'Author Email',
            type: 'text',
            subType: 'email',
        },
        intercomLink: {
            name: 'Intercom Link',
            type: 'text',
            subType: 'url',
            description: 'Link to original conversation',
            getValue: (item, account) =>
                `https://app.intercom.com/a/apps/${account.intercomAppId}/inbox/inbox/all/conversations/${item.id}`,
        },
        'first_contact_reply.url': {
            name: 'First Contact Reply URL',
            type: 'text',
            subType: 'url',
            description:
                'The URL where the first reply originated from. For Twitter and Email replies, this will be blank.',
        },
        'source.subject': {
            name: 'Subject',
            type: 'text',
            description:
                'Optional. The message subject. For Twitter, this will show a generic message regarding why the subject is obscured.',
        },
        read: {
            name: 'Read',
            type: 'text',
            description: 'Indicates whether a conversation has been read.',
            subType: 'boolean',
        },
        priority: {
            name: 'Priority',
            type: 'text',
            subType: 'boolean',
            getValue: (item) => item.priority === 'priority',
            description:
                'If marked as priority, it will return priority or else not_priority.',
        },
        'source.delivered_as': {
            name: 'Delivered As ',
            type: 'text',
            description:
                'Optional. The message subject. For Twitter, this will show a generic message regarding why.',
        },
        created_at: {
            name: 'Created At',
            type: 'date',
            description: 'The time the conversation was created.',
        },
        'statistics.first_contact_reply_at': {
            name: 'First Contact Reply At',
            type: 'date',
            description: 'Time of first text conversation part from a contact.',
        },
        'statistics.first_admin_reply_at': {
            name: 'First Admin Reply At',
            type: 'date',
            description:
                'Time of first admin reply after first_contact_reply_at.',
        },
        'statistics.last_contact_reply_at': {
            name: 'Last Contact Reply At',
            type: 'date',
            description: 'Time of the last conversation part from a contact.',
        },
        'statistics.last_admin_reply_at': {
            name: 'Last Admin Reply At',
            type: 'date',
            description: 'Time of the last conversation part from an admin.',
        },
        updated_at: {
            name: 'Updated At',
            type: 'date',
            description: 'The last time the conversation was updated.',
        },
        'sla_applied.sla_name': {
            name: 'SLA Name',
            type: 'text',
            description:
                'The name of the SLA as given by the teammate when it was created.',
        },
        'sla_applied.sla_status': {
            name: 'SLA Status',
            type: 'text',
            description: 'One of “hit”, ”missed”, or “cancelled”.',
        },
        files: {
            type: 'array[text]',
            subType: 'file',
        },
        __syncAction: {
            type: `text`,
            getValue: () => 'SET',
        },
    },
    companies: {
        id: {type: 'id'},
        name: {type: 'text'},
        tagsIds: {
            type: 'array[text]',
            description: 'A list of tags associated with the company.',
            getValue: (item) => item.tags.tags.map(getId),
            relation: {
                cardinality: 'many-to-many',
                name: 'Tags',
                targetName: 'Companies',
                targetType: 'tags',
                targetFieldId: 'id',
            },
        },
        user_count: {type: 'number', subType: 'integer'},
        monthly_spend: {type: 'number'},
        website: {type: 'text', subType: 'url'},
        intercomLink: {
            name: 'Intercom Link',
            type: 'text',
            subType: 'url',
            description: 'Link to original conversation',
            getValue: (item, account) =>
                `https://app.intercom.com/a/apps/${account.intercomAppId}/companies/${item.id}`,
        },
        last_request_at: {type: 'date'},
        created_at: {type: 'date'},
        session_count: {type: 'number', subType: 'integer'},
        'plan.name': {type: 'text'},
        size: {type: 'number', subType: 'integer'},
        industry: {type: 'text'},
        company_id: {type: 'id'},
        remote_created_at: {type: 'date'},
        updated_at: {type: 'date'},
        __syncAction: {
            type: `text`,
            getValue: () => 'SET',
        },
    },
    tags: {
        id: {type: 'id'},
        name: {
            type: 'text',
        },
    },
    admins: {
        id: {type: 'id'},
        name: {
            type: 'text',
        },
        email: {
            type: 'text',
            subType: 'email',
            name: 'Email',
            description: 'The email address of the admin',
        },
        job_title: {
            type: 'text',
            name: 'Job Title',
            description: 'The job title of the admin',
        },
        away_mode_enabled: {
            type: 'text',
            subType: 'boolean',
            name: 'Away Mode Enabled',
            description:
                'Identifies if this admin is currently set in away mode.',
        },
        away_mode_reassign: {
            type: 'text',
            subType: 'boolean',
            name: 'Away Mode Reassign',
            description:
                'Identifies if this admin is set to automatically reassign new conversations to the apps default inbox.',
        },
        has_inbox_seat: {
            type: 'text',
            subType: 'boolean',
            name: 'Has Inbox Seat',
            description:
                'Identifies if a teammate has a paid inbox seat to restrict/allow features that require them',
        },
    },
};

const fetchAttributes = (model) => (cache, token) =>
    cache.ensureValue(
        calculateHash(`${model}-${token}`),
        () => listAttributes({token, model}).then((res) => res.body),
        6 * 60,
    );
const calculateHash = (str) => {
    const hashfn = crypto.createHash(`sha256`);
    hashfn.update(str);
    return hashfn.digest(`hex`);
};
const noopFetcher = () => ({data: []});

const attributeFetchers = {
    contacts: fetchAttributes('contact'),
    companies: fetchAttributes('company'),
};

const escapeName = (name) => name.replace(/_/g, ' ').replace(/\./g, '#');

const formatSchema = (schema) => {
    const formatted = {};

    Object.entries(schema).forEach(([key, config], idx) => {
        const name = escapeName(config.name || key);

        formatted[key] = {
            ...config,
            name,
            order: idx,
        };
    });

    return formatted;
};

export const getSchema =
    ({cache}) =>
    async ({source, account}) => {
        const staticSchema = appSchema[source];

        if (!staticSchema) {
            throw badRequest(`Schema is not defined for ${source}`);
        }

        const fetcher = attributeFetchers[source] || noopFetcher;

        const {data} = await fetcher(cache, account.token);

        const dynamicSchema = {};

        data.forEach((attr) => {
            if (attr.custom || staticSchema[attr.full_name]) {
                // prefer statically defined type (e.g. intercom id fields are defined as string)
                const schemaField = staticSchema[attr.full_name]
                    ? staticSchema[attr.full_name]
                    : mapType(attr.data_type);

                if (!schemaField) {
                    return;
                }

                dynamicSchema[attr.full_name] = {
                    type: schemaField.type,
                    subType: schemaField.subType,
                    name: attr.label,
                    description: attr.description,
                };
            }
        });

        const schema = {
            ...staticSchema,
            ...dynamicSchema,
        };

        return formatSchema(schema);
    };

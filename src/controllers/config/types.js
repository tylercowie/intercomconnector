import dateFns from 'date-fns';

export const Types = {
    contacts: {
        id: 'contacts',
        name: 'Contact',
        description:
            'The Contacts source provides details on these contacts within Intercom, and will specify whether they are a user or lead through the role attribute',
        default: true,
    },
    companies: {
        id: 'companies',
        name: 'Company',
        description:
            'Companies allow you to represent organizations using your product.',
        default: true,
    },
    conversations: {
        id: 'conversations',
        name: 'Conversation',
        description:
            'Conversations are how you can communicate with users in Intercom. They are created when a contact replies to an outbound message, or when one admin directly sends a message to a single contact.',
        default: true,
    },
    tags: {
        id: 'tags',
        name: 'Tag',
        description:
            'A tag allows you to label your contacts and companies and list them using that tag.',
    },
    admins: {
        id: 'admins',
        name: 'Teammate',
        description:
            'Admins are the teammate accounts that have access to a workspace.',
        default: true,
    },
};

export const Filters = {
    role: {
        id: 'role',
        title: 'Role',
        datalist: true,
        optional: true,
        type: 'multidropdown',
    },
    updated_at: {
        id: 'updated_at',
        title: 'Updated After',
        optional: true,
        type: 'datebox',
        datalist: false,
        get defaultValue() {
            return dateFns.subMonths(new Date(), 1).toISOString();
        },
    },
};

export const AuthTypes = {
    token: {
        description: 'Provide Intercom App Token',
        name: 'Token Authentication',
        id: 'token',
        fields: [
            {
                type: 'text',
                description: 'Intercom Token',
                id: 'token',
            },
            {
                type: 'link',
                value: 'https://app.intercom.com/a/apps/_/developer-hub',
                description:
                    'You can find your Access Token in the Configure > Authentication section in your app within the Developer Hub.',
                id: 'token_link',
                name: 'Click here to open Developer Hub',
            },
            {
                type: 'link',
                value: '',
                optional: true,
                description:
                    'Please note: realtime synchronization is not supported for token-based accounts.',
                id: 'note',
                name: '',
            },
        ],
    },
    oauth2: {
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
};

import {build, bool, oneOf, perBuild} from '@jackfranklin/test-data-bot';
import {fakeTimestamp} from './fakeTimestamp.js';
import {faker} from '@faker-js/faker';

// https://developers.intercom.com/intercom-api-reference/reference#data-attribute-model
export const dataAttributeBuilder = build({
    fields: {
        type: 'data_attribute',
        model: oneOf('contact', 'company'),
        name: 'attribute',
        description: 'Attribute description',
        data_type: oneOf('string', 'integer', 'float', 'boolean', 'date'),
        options: [],
        api_writable: bool(),
        ui_writable: bool(),
        custom: false,
        archived: false,
        admin_id: perBuild(() => faker.datatype.uuid()),
        created_at: perBuild(fakeTimestamp),
        updated_at: perBuild(fakeTimestamp),
    },
    postBuild: (attr) => {
        attr.full_name = attr.name;
        attr.label = attr.name;
        return attr;
    },
    traits: {
        custom: {
            overrides: {custom: true},
        },
        contact: {
            overrides: {model: 'contact'},
        },
        company: {
            overrides: {model: 'company'},
        },
        string: {
            overrides: {data_type: 'string'},
        },
        integer: {
            overrides: {data_type: 'integer'},
        },
        float: {
            overrides: {data_type: 'float'},
        },
        boolean: {
            overrides: {data_type: 'boolean'},
        },
        date: {
            overrides: {data_type: 'date'},
        },
    },
});

import {build, perBuild} from '@jackfranklin/test-data-bot';
import {faker} from '@faker-js/faker';
import {fakeTimestamp} from './fakeTimestamp.js';

// https://developers.intercom.com/intercom-api-reference/reference#company-model
export const companyBuilder = build({
    fields: {
        type: 'company',
        id: perBuild(() => faker.datatype.uuid()),
        name: perBuild(() => faker.company.name()),
        plan: {name: 'free'},
        company_id: perBuild(() => faker.datatype.uuid()),
        remote_created_at: perBuild(fakeTimestamp),
        created_at: perBuild(fakeTimestamp),
        updated_at: perBuild(fakeTimestamp),
        last_request_at: perBuild(fakeTimestamp),
        size: perBuild(() => faker.datatype.number()),
        website: 'http://www.example.com',
        industry: perBuild(() => faker.commerce.department()),
        monthly_spend: perBuild(() => faker.datatype.number()),
        session_count: perBuild(() => faker.datatype.number()),
        user_count: perBuild(() => faker.datatype.number()),
        custom_attributes: {},
        tags: {
            type: 'tag.list',
            tags: [],
        },
    },
});

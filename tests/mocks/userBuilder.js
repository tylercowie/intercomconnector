import {build, bool, perBuild} from '@jackfranklin/test-data-bot';
import {faker} from '@faker-js/faker';

// https://developers.intercom.com/intercom-api-reference/reference#admin-model
export const userBuilder = build({
    fields: {
        type: 'admin',
        id: perBuild(() => faker.datatype.uuid()),
        name: perBuild(() => faker.name.fullName()),
        email: perBuild(() => faker.internet.email()),
        job_title: perBuild(() => faker.name.jobTitle()),
        away_mode_enabled: bool(),
        away_mode_reassign: bool(),
        has_inbox_seat: bool(),
        team_ids: [],
        app: {
            type: 'app',
            id_code: 'abbh4d7q',
            name: 'fibery [DEV]',
            created_at: 1597839743,
            secure: false,
            identity_verification: false,
            timezone: 'Europe/Minsk',
        },
    },
});

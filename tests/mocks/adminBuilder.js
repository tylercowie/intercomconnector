// https://developers.intercom.com/intercom-api-reference/reference#admin-model

export const adminBuilder = (seed) => ({
    type: 'admin',
    id: seed,
    name: `Admin ${seed}`,
    email: `admin${seed}@mail.com`,
    job_title: `Job ${seed}`,
    away_mode_enabled: false,
    away_mode_reassign: false,
    has_inbox_seat: false,
    team_ids: [],
    avatar: null,
});

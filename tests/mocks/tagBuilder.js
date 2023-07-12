// https://developers.intercom.com/intercom-api-reference/reference#tag-model
export const tagBuilder = (seed) => ({
    type: 'tag',
    id: seed,
    name: `Tag ${seed}`,
});

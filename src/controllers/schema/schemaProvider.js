import {getSchema} from './getSchema.js';

export const createSchemaProvider = ({cache}) => {
    const getSchemaCached = getSchema({cache});

    return {
        getSchema: getSchemaCached,
        getSyncSchema: async ({types, account}) => {
            const syncSchema = {};

            await Promise.all(
                types.map(async (source) => {
                    syncSchema[source] = await getSchemaCached({
                        source,
                        account,
                    });
                }),
            );

            return syncSchema;
        },
    };
};

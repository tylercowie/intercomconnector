import mongodb from 'mongodb';

const {ObjectId} = mongodb;

export const createWebhooksCollection = (mongoClient) => {
    const getCollection = async () => {
        const db = await mongoClient.connect();
        return db.collection('webhook');
    };

    return {
        async find(query) {
            const colleciton = await getCollection();
            return colleciton.find(query);
        },
        async insertOne({url, types, appId}) {
            const colleciton = await getCollection();
            const createdAt = new Date();
            const toInsert = {
                createdAt,
                updatedAt: createdAt,
                url,
                types,
                appId,
            };

            const {insertedId} = await colleciton.insertOne({
                createdAt,
                updatedAt: createdAt,
                url,
                types,
                appId,
            });

            return {
                _id: insertedId,
                ...toInsert,
            };
        },
        async setById(id, {url, types, appId}) {
            const colleciton = await getCollection();
            const {value} = await colleciton.findOneAndUpdate(
                {_id: new ObjectId(id)},
                {
                    $currentDate: {
                        updatedAt: true,
                    },
                    $set: {url, types, appId},
                },
                {returnDocument: 'after'},
            );

            return value;
        },
        async deleteById(id) {
            const colleciton = await getCollection();
            return colleciton.deleteOne({_id: new ObjectId(id)});
        },
    };
};

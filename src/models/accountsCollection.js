import mongodb from 'mongodb';

const {ObjectId} = mongodb;

export const createAccountsCollection = (mongoClient) => {
    const getCollection = async () => {
        const db = await mongoClient.connect();
        return db.collection('accounts');
    };

    return {
        async find(query) {
            const colleciton = await getCollection();
            return colleciton.find(query);
        },
        async findById(id) {
            const colleciton = await getCollection();
            return colleciton.findOne({_id: id});
        },
        async setById(id, {token}) {
            const colleciton = await getCollection();
            const {value} = await colleciton.findOneAndUpdate(
                {_id: id},
                {
                    $currentDate: {
                        updatedAt: true,
                    },
                    $set: {token},
                },
                {returnDocument: 'after', upsert: true},
            );

            return value;
        },
        async deleteById(id) {
            const colleciton = await getCollection();
            return colleciton.deleteOne({_id: ObjectId(id)});
        },
    };
};

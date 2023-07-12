import mongodb from 'mongodb';
import {log} from '../log.js';

const {MongoClient} = mongodb;

export const createMongoClient = (mongoDsn, mongoDbName) => {
    let client;
    return {
        async connect() {
            if (!client) {
                client = await MongoClient.connect(mongoDsn);
                log.info(`mongo db client is connected to ${mongoDbName}`);
                client.on(`close`, () => {
                    log.info(`mongo db client is disconnected`);
                    client = null;
                });
            }

            return client.db(mongoDbName);
        },
        async disconnect() {
            if (client) {
                await client.close();
                client = null;
            }
        },
        async checkConnection() {
            if (!client) {
                throw Error(`Mongo client is null`);
            }

            await client
                .db(mongoDbName)
                .collection(`statusCheckCollection`)
                .countDocuments({});
        },
    };
};

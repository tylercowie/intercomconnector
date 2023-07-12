import {getSyncData} from './getSyncData.js';
import {streamData} from './streamData.js';

export const createDataProvider = ({schemaProvider}) => {
    return {
        streamData: streamData({schemaProvider}),
        getSyncData: getSyncData({schemaProvider}),
    };
};

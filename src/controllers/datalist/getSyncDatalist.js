import {getDatalist} from './getDatalist.js';

export const getSyncDatalist = ({types, field}) => {
    let items = [];

    types.forEach((source) => {
        items = items.concat(getDatalist({source, field}));
    });

    return {items};
};

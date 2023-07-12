import get from 'lodash/get.js';
import {log} from '../../log.js';
import {timestampToISO} from './dateConverters.js';

const convertType = (type, value) => {
    switch (type) {
        case 'date':
            if (new Date(value * 1000).getFullYear() > 2500) {
                throw new Error(`Wrong date value: ${value}`);
            }
            return timestampToISO(value);
        default:
            return value;
    }
};

export const formatItem = (schema, account, item) => {
    try {
        const formatted = {};

        Object.entries(schema).forEach(([key, config]) => {
            const value = config.getValue
                ? config.getValue(item, account)
                : get(item, key);

            formatted[key] = value
                ? convertType(config.type, value)
                : value;
        });

        return formatted;
    } catch (err) {
        log.error(
            `Failed to format item with ${err}. Item: ${JSON.stringify(item)}`,
        );
        throw new Error(
            `Failed to format ${item.type} with id ${item.id}. ${err}`,
        );
    }
};

export const formatItems = (schema, account, items) =>
    items.map((item) => formatItem(schema, account, item));

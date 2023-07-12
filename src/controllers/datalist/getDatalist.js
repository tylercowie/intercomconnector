import {badRequest} from '../../errors.js';
import {Datalists} from './datalists.js';
import {Filters, Types} from '../config/types.js';

export const getDatalist = ({source, field}) => {
    if (!Types[source] || !Filters[field]) {
        throw badRequest(`Unknown source type: ${source} - ${field}`);
    }

    return (Datalists[source] && Datalists[source][field]) || [];
};

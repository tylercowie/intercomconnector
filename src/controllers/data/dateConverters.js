import fns from 'date-fns';

export const timestampToISO = (timestamp) =>
    new Date(timestamp * 1000).toISOString();

export const ISOToTimestamp = (iso) =>
    Math.floor(new Date(iso).getTime() / 1000);

export const formatTimestamp = (timestamp, format = 'dd-MMM-yyyy') =>
    fns.format(timestamp * 1000, format);

export const getMaxTimestamp = (...isos) =>
    Math.max(...isos.map((iso) => ISOToTimestamp(iso) || 0));

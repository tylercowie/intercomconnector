import {getError} from './errors.js';

export const getErrorStatusCode = (err) => {
    if (err.response) {
        return err.response.statusCode;
    }

    return err.status || 500;
};

export const getErrorMessage = (err) => {
    if (
        err.response &&
        err.response.body &&
        err.response.body.errors &&
        err.response.body.errors[0]
    ) {
        return err.response.body.errors[0].message;
    }

    return err.message || 'Unknown Error';
};

export const transformError = (err) => {
    const error = getError(getErrorMessage(err), getErrorStatusCode(err));

    if (err.stack) {
        error.stack = err.stack;
    }
    error.name = err.name;

    return error;
};

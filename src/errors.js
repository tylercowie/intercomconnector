export const getError = (message, status) => {
    const err = new Error(message);
    err.status = status;

    return err;
};

export const badRequest = (message) => getError(message, 400);
export const forbidden = (message) => getError(message, 403);
export const notFound = (message) => getError(message, 404);

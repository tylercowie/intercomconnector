import got from 'got';

export const getRestClient = (url) => {
    const fetch = got.extend({
        throwHttpErrors: false,
        responseType: 'json',
    });

    return {
        getConnectorConfig() {
            return fetch(`${url}`);
        },
        getSyncConfig() {
            return fetch(`${url}/api/v1/synchronizer/config`, {method: `POST`});
        },
        getLogo() {
            return fetch(`${url}/logo`, {responseType: 'text'});
        },

        authorize({state}) {
            return fetch(`${url}/oauth2/v1/authorize`, {
                method: `POST`,
                json: {state},
            });
        },
        getAccessToken({code}) {
            return fetch(`${url}/oauth2/v1/access_token`, {
                method: `POST`,
                json: {code},
            });
        },

        status() {
            return fetch(`${url}/status`, {});
        },

        validate({token}) {
            return fetch(`${url}/validate`, {
                method: `POST`,
                json: {
                    fields: {
                        token,
                    },
                },
            });
        },

        getDatalist({field, source}) {
            return fetch(`${url}/datalist`, {
                method: `POST`,
                searchParams: {
                    field,
                    source,
                },
            });
        },

        getSyncDatalist({types, account, field}) {
            return fetch(`${url}/api/v1/synchronizer/datalist`, {
                method: `POST`,
                json: {
                    field,
                    types,
                    account,
                },
            });
        },

        getData: ({source, account, filter = {}}) =>
            fetch(url, {
                method: `POST`,
                json: {
                    account,
                    source,
                    filter,
                },
            }),
        getSyncData: ({
            requestedType,
            account,
            filter = {},
            pagination,
            lastSynchronizedAt,
        }) =>
            fetch(`${url}/api/v1/synchronizer/data`, {
                method: `POST`,
                json: {
                    account,
                    requestedType,
                    filter,
                    pagination,
                    lastSynchronizedAt,
                },
            }),

        getSchema: ({source, account}) =>
            fetch(`${url}/schema`, {
                method: `POST`,
                json: {
                    account,
                    source,
                },
            }),
        getSyncSchema: ({types, account, filter = {}}) =>
            fetch(`${url}/api/v1/synchronizer/schema`, {
                method: `POST`,
                json: {
                    account,
                    types,
                    filter,
                },
            }),

        validateFilter: ({filter, account}) =>
            fetch(`${url}/validate/filter`, {
                method: `POST`,
                responseType: 'text',
                json: {
                    account,
                    filter,
                },
            }),

        registerWebhook: ({account, webhook, types, url: webhookUrl}) =>
            fetch(`${url}/api/v1/synchronizer/webhooks`, {
                method: `POST`,
                json: {
                    account,
                    webhook,
                    types,
                    url: webhookUrl,
                },
            }),
        deleteWebhook: ({webhook}) =>
            fetch(`${url}/api/v1/synchronizer/webhooks`, {
                method: `DELETE`,
                json: {
                    webhook,
                },
            }),
        verifyWebhook: ({payload, params}) =>
            fetch(`${url}/api/v1/synchronizer/webhooks/verify`, {
                method: `POST`,
                json: {
                    payload,
                    params,
                },
            }),
        transformWebhook: ({payload, params, account, types}) =>
            fetch(`${url}/api/v1/synchronizer/webhooks/transform`, {
                method: `POST`,
                json: {
                    payload,
                    params,
                    account,
                    types,
                },
            }),
        incomeWebhook: (body, headers = {}) =>
            fetch(`${url}/api/v1/synchronizer/webhooks/income`, {
                method: `POST`,
                json: body,
                headers,
            }),
        conversationImg: ({id, partId, accountId}) =>
            fetch(
                partId
                    ? `${url}/api/v1/conversation/${id}/${partId}/img`
                    : `${url}/api/v1/conversation/${id}/img`,
                {searchParams: {accountId}},
            ),
    };
};

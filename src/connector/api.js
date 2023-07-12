import FormData from 'form-data';
import {fetch} from '../fetch.js';

export const API_VERSION = '2.2';

const fetchIntercom = (
    url,
    {token, searchParams, method = 'GET', json, body},
) =>
    fetch(`https://api.intercom.io/${url}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        searchParams,
        responseType: 'json',
        method,
        json,
        body,
    });

export const getMe = ({token}) => fetchIntercom('me', {token});

export const searchContacts = ({token, perPage = 100, startingAfter, query}) =>
    fetchIntercom(`contacts/search`, {
        token,
        json: {
            pagination: {
                per_page: perPage,
                starting_after: startingAfter,
            },
            query,
        },
        method: 'POST',
    });

export const scrollCompanies = ({token, scrollParam}) =>
    fetchIntercom(`companies/scroll`, {
        token,
        searchParams: {
            scroll_param: scrollParam,
        },
    });

export const fetchCompany = ({token, id}) =>
    fetchIntercom(`companies/${id}`, {
        token,
    });

export const fetchContactCompanies = ({token, id, perPage = 50, page}) =>
    fetchIntercom(`contacts/${id}/companies`, {
        token,
        searchParams: {
            per_page: perPage,
            page,
        },
    });

export const fetchConversation = ({token, id}) =>
    fetchIntercom(`conversations/${id}`, {token});

export const searchConversations = ({
    token,
    startingAfter,
    perPage = 100,
    query,
}) =>
    fetchIntercom(`conversations/search`, {
        token,
        json: {
            pagination: {
                per_page: perPage,
                starting_after: startingAfter,
            },
            query,
        },
        method: 'POST',
    });

export const listAttributes = ({token, model}) =>
    fetchIntercom(`data_attributes`, {
        token,
        searchParams: {
            model,
        },
    });

export const listTags = ({token}) =>
    fetchIntercom(`tags`, {
        token,
    });

export const listContactTags = ({token, id}) =>
    fetchIntercom(`contacts/${id}/tags`, {
        token,
    });

export const fetchContact = ({id, token}) =>
    fetchIntercom(`contacts/${id}`, {
        token,
    });

export const listAdmins = ({token}) =>
    fetchIntercom(`admins`, {
        token,
    });

export const getAccessToken = ({code, clientId, clientSecret}) => {
    const form = new FormData();

    form.append('code', code);
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);

    return fetchIntercom(`auth/eagle/token`, {
        method: 'POST',
        body: form,
    });
};

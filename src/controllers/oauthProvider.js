import {getAccessToken} from '../connector/api.js';

export const createOAuthProvider = ({clientId, clientSecret}) => {
    return {
        authorize: ({state}) => {
            const searchParams = new URLSearchParams({
                state,
                client_id: clientId,
            });

            return {
                redirect_uri: `https://app.intercom.com/oauth?${searchParams.toString()}`,
            };
        },
        getAccessToken: async ({code}) => {
            const {body} = await getAccessToken({
                code,
                clientId,
                clientSecret,
            });

            return {
                token: body.token,
            };
        },
    };
};

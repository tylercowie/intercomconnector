export const deleteWebhook = ({webhooksCollection}) => async ({webhook}) => {
    await webhooksCollection.deleteById(webhook.hookId);

    return {ok: true};
};

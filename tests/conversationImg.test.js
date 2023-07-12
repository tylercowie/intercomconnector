import nock from 'nock';
import {conversationBuilder} from './mocks/conversationBuilder.js';
import {userBuilder} from './mocks/userBuilder.js';
import {createTestApp} from './testApp.js';
import {getRestClient} from './restClient.js';

describe(`conversation image`, () => {
    let app;
    let restClient;
    const token = 'test_token';
    const intercom = nock(`https://api.intercom.io`, {
        reqheaders: {
            Authorization: `Bearer ${token}`,
        },
    });
    const validateAccount = async () => {
        const user = userBuilder();
        intercom.get(`/me`).reply(200, user, {
            'Intercom-Version': '2.2',
        });
        const {body} = await restClient.validate({token});
        return body;
    };

    beforeAll(async () => {
        app = await createTestApp();
        restClient = getRestClient(app.url);
    });

    it('should return bad request when accountId is missing', async () => {
        const res = await restClient.conversationImg({id: '1'});
        expect(res.statusCode).toEqual(400);
    });
    it('should return not found when accountId is unknown', async () => {
        const res = await restClient.conversationImg({
            id: '1',
            accountId: '1234325',
        });
        expect(res.statusCode).toEqual(404);
    });
    it('should return not found when there are no images in message', async () => {
        const account = await validateAccount();
        const conversation = conversationBuilder();

        intercom
            .get(`/conversations/${conversation.id}`)
            .reply(200, conversation);

        const res = await restClient.conversationImg({
            id: conversation.id,
            accountId: account.accountId,
        });

        expect(res.statusCode).toEqual(404);
    });
    it('should return fresh image', async () => {
        const account = await validateAccount();
        const conversation = conversationBuilder();

        const imgPath = `/i/o/344227860/2c0e66292ea1c96ccbe14cfa/Screen+Shot+2021-05-31+at+17.39.49.png?expires=1624654017&amp;signature=47f2aab47d606ea1dd2b0e98a80a56ff2153a36b7d11b6eb9ecd200aeeb6255c`;
        const downloadUrl = `https://downloads.intercomcdn.com${imgPath}`;

        intercom.get(`/conversations/${conversation.id}`).reply(200, {
            ...conversation,
            source: {
                ...conversation.source,
                body: `<div class="intercom-container"><img src="${downloadUrl}"></div>`,
            },
        });

        nock('https://downloads.intercomcdn.com')
            .get(imgPath)
            .reply(200, {success: true});

        const res = await restClient.conversationImg({
            id: conversation.id,
            accountId: account.accountId,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({success: true});
    });
    it('should return fresh image for conversation part', async () => {
        const account = await validateAccount();
        const conversation = conversationBuilder();

        const imgPath = `/i/o/344227860/2c0e66292ea1c96ccbe14cfa/Screen+Shot+2021-05-31+at+17.39.49.png?expires=1624654017&amp;signature=47f2aab47d606ea1dd2b0e98a80a56ff2153a36b7d11b6eb9ecd200aeeb6255c`;
        const downloadUrl = `https://downloads.intercomcdn.com${imgPath}`;

        intercom.get(`/conversations/${conversation.id}`).reply(200, {
            ...conversation,
            conversation_parts: {
                type: 'conversation_part.list',
                conversation_parts: [
                    {
                        id: 'part1',
                        author: {name: 'author1'},
                        created_at: 1602415800,
                        body: `<div class="intercom-container"><img src="${downloadUrl}"></div>`,
                    },
                ],
            },
        });

        nock('https://downloads.intercomcdn.com')
            .get(imgPath)
            .reply(200, {success: true});

        const res = await restClient.conversationImg({
            id: conversation.id,
            partId: 'part1',
            accountId: account.accountId,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({success: true});
    });
});

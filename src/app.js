import Koa from 'koa';
import Router from 'koa-router';
import {koaBody} from 'koa-body';
import send from 'koa-send';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {correlationMw} from './correlationId.js';
import {log, requestLogMw} from './log.js';
import {validateAccount} from './controllers/validateAccount.js';
import {getConnectorConfig} from './controllers/config/getConnectorConfig.js';
import {getDatalist} from './controllers/datalist/getDatalist.js';
import {getStatus} from './controllers/getStatus.js';
import {transformError} from './transformError.js';
import {getSyncConfig} from './controllers/config/getSyncConfig.js';
import {getSyncDatalist} from './controllers/datalist/getSyncDatalist.js';
import {createSchemaProvider} from './controllers/schema/schemaProvider.js';
import {createDataProvider} from './controllers/data/dataProvider.js';
import {createOAuthProvider} from './controllers/oauthProvider.js';
import {createWebhooksProvider} from './controllers/webhooks/webhooksProvider.js';
import {fetchConversationImage} from './controllers/data/fetchConversationImage.js';
import {badRequest} from './errors.js';
import {fetchResource} from './controllers/resources/fetchResource.js';
import {verifySignature} from './controllers/webhooks/verifyWebhook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RAW_BODY = Symbol.for('unparsedBody');

export const createApp = ({cache, clientId, clientSecret, mongoClient}) => {
    const app = new Koa();
    const schemaProvider = createSchemaProvider({cache});
    const dataProvider = createDataProvider({schemaProvider});
    const oauth = createOAuthProvider({clientId, clientSecret});
    const webhooksProvider = createWebhooksProvider({
        clientSecret,
        schemaProvider,
        mongoClient,
    });

    app.on('error', (err) => {
        log.error(`Server error: ${err.message}`, err);
    });

    app.use(correlationMw);
    app.use(requestLogMw);
    app.use(
        koaBody({
            parsedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
            includeUnparsed: true,
        }),
    );
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            const error = transformError(err);
            ctx.status = error.status;
            ctx.body = {
                message: error.message,
                status: error.status,
            };

            if (error.status < 500) {
                log.warn(`Client error: ${error.message}`, error);
            } else {
                ctx.app.emit('error', error, ctx);
            }
        }
    });

    const router = new Router();

    router.get(`/`, async (ctx) => {
        ctx.body = getConnectorConfig();
    });
    router.post(`/`, async (ctx) => {
        ctx.body = await dataProvider.streamData(ctx.request.body);
    });
    router.get('/logo', async (ctx) => {
        await send(ctx, `./logo.svg`, {root: __dirname});
    });
    router.get(`/status`, async (ctx) => {
        ctx.body = await getStatus({mongoClient});
    });
    router.post(`/datalist`, async (ctx) => {
        ctx.body = getDatalist(ctx.query);
    });
    router.post(`/validate`, async (ctx) => {
        ctx.body = await validateAccount({mongoClient}, ctx.request.body);
    });
    router.post(`/validate/filter`, async (ctx) => {
        ctx.status = 200;
    });
    router.post(`/schema`, async (ctx) => {
        ctx.body = await schemaProvider.getSchema(ctx.request.body);
    });

    router.post(`/api/v1/synchronizer/config`, async (ctx) => {
        ctx.body = await getSyncConfig(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/schema`, async (ctx) => {
        ctx.body = await schemaProvider.getSyncSchema(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/data`, async (ctx) => {
        ctx.body = await dataProvider.getSyncData(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/datalist`, async (ctx) => {
        ctx.body = await getSyncDatalist(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/webhooks`, async (ctx) => {
        ctx.body = await webhooksProvider.setupWebhook(ctx.request.body);
    });
    router.delete(`/api/v1/synchronizer/webhooks`, async (ctx) => {
        ctx.body = await webhooksProvider.deleteWebhook(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/webhooks/verify`, async (ctx) => {
        ctx.body = await webhooksProvider.verifyWebhook(ctx.request.body);
    });
    router.post(`/api/v1/synchronizer/webhooks/transform`, async (ctx) => {
        ctx.body = await webhooksProvider.transformWebhookPayload(
            ctx.request.body,
        );
    });

    router.post(`/oauth2/v1/authorize`, (ctx) => {
        ctx.body = oauth.authorize(ctx.request.body);
    });
    router.post(`/oauth2/v1/access_token`, async (ctx) => {
        ctx.body = await oauth.getAccessToken(ctx.request.body);
    });

    router.post('/api/v1/synchronizer/resource', async (ctx) => {
        ctx.body = await fetchResource(ctx.request.body);
    });

    // --- public routes ---
    router.post(`/api/v1/synchronizer/webhooks/income`, async (ctx) => {
        verifySignature({
            rawBody: ctx.request.body?.[RAW_BODY],
            secret: clientSecret,
            signature: ctx.headers['x-hub-signature'],
        });

        ctx.body = await webhooksProvider.handleIncomingMessage(
            ctx.request.body,
            ctx.headers,
        );
    });
    // used for images inside text fields
    router.get(`/api/v1/conversation/:id/:partId?/img`, async (ctx) => {
        if (!ctx.request.query.accountId) {
            throw badRequest(`accountId is required`);
        }
        ctx.body = await fetchConversationImage(
            {mongoClient},
            {
                id: ctx.params.id,
                partId: ctx.params.partId,
                accountId: ctx.query.accountId,
            },
        );
    });

    app.use(router.routes()).use(router.allowedMethods());

    return app;
};

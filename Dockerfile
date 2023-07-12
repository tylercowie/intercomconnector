FROM node:18.12.1-alpine as base
ENV NODE_ENV production
WORKDIR /intercom-connector
COPY package.json ./

FROM base as deps
RUN corepack enable && corepack prepare pnpm@7.19.0 --activate
COPY pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts --frozen-lockfile --prod

FROM base as release
COPY --from=deps /intercom-connector/node_modules ./node_modules
COPY src ./src
USER node
CMD ["node", "src/server.js"]
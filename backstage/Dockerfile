FROM node:22.20.0-bookworm-slim AS build
ENV YARN_NODE_LINKER=node-modules

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ build-essential && \
    yarn config set python /usr/bin/python3

WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY packages ./packages
COPY plugins ./plugins
RUN corepack prepare yarn@4.8.1 --activate && \
    yarn install

COPY catalog ./catalog
COPY app-config.yaml ./
RUN yarn build

# ---- Runner stage ----
FROM node:22.20.0-trixie-slim AS runner

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    corepack enable && \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ build-essential && \
    yarn config set python /usr/bin/python3

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
ENV COREPACK_HOME=/tmp/corepack

USER node
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node \
    /app/yarn.lock \
    /app/package.json \
    /app/packages/backend/dist/skeleton.tar.gz \
    ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

COPY --from=build --chown=node:node /app/packages/app/package.json ./packages/app/package.json
COPY --from=build --chown=node:node /app/packages/app/dist ./packages/app/dist

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    corepack prepare yarn@4.8.1 --activate && \
    yarn workspaces focus backend --production


COPY --from=build --chown=node:node /app/packages/backend/dist/bundle.tar.gz ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

COPY --chown=node:node app-config*.yaml ./
COPY --from=build --chown=node:node /app/catalog ./catalog

CMD ["node", "packages/backend", "--config", "app-config.yaml"]

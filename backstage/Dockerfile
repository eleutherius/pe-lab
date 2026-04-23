FROM node:22.20.0-bookworm AS build

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ build-essential && \
    yarn config set python /usr/bin/python3

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages ./packages
RUN corepack enable && corepack prepare yarn@4.8.1 --activate && \
    yarn install --immutable

COPY packages/ ./packages/
RUN yarn build:backend

# ---- Runner stage ----
FROM node:22.20.0-trixie AS runner

# isolate-vm requires native compilation at yarn install time
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-venv g++ build-essential && \
    yarn config set python /usr/bin/python3

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

USER node
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node \
    /app/yarn.lock \
    /app/package.json \
    /app/packages/backend/dist/skeleton.tar.gz \
    ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN --mount=type=cache,target=/home/node/.cache/yarn,sharing=locked,uid=1000,gid=1000 \
    yarn install --frozen-lockfile --production --network-timeout 300000

COPY --from=build --chown=node:node /app/packages/backend/dist/bundle.tar.gz ./
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

COPY --chown=node:node app-config*.yaml ./
# COPY --chown=node:node catalog/ ./catalog/

CMD ["node", "packages/backend", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]

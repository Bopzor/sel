FROM ghcr.io/pnpm/pnpm:12.4.1 AS base
RUN pnpm runtime set node 24 -g

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY . /app
WORKDIR /app
RUN pnpm install --offline --frozen-lockfile
RUN pnpm exec tsc -b

EXPOSE 3000
CMD pnpm run --filter @sel/server start

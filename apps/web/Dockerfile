FROM ghcr.io/pnpm/pnpm:12.4.1 AS build
RUN pnpm runtime set node 24 -g

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch

COPY . /app
WORKDIR /app
RUN pnpm install --offline --frozen-lockfile
RUN pnpm run --filter=@sel/web build

FROM nginx:latest

COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY --from=build /app/apps/web/env.template.js /env.template.js
COPY --from=build /app/apps/web/entrypoint.sh /docker-entrypoint.d/99-app-entrypoint.sh

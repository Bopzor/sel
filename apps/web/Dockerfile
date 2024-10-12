FROM node:20-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_ANALYTICS_URL
ENV VITE_ANALYTICS_URL=$VITE_ANALYTICS_URL

ARG VITE_ANALYTICS_SITE_ID
ENV VITE_ANALYTICS_SITE_ID=$VITE_ANALYTICS_SITE_ID

ARG VITE_GEOAPIFY_API_KEY
ENV VITE_GEOAPIFY_API_KEY=$VITE_GEOAPIFY_API_KEY

ARG VITE_WEB_PUSH_PUBLIC_KEY
ENV VITE_WEB_PUSH_PUBLIC_KEY=$VITE_WEB_PUSH_PUBLIC_KEY

RUN pnpm run --filter=@sel/web build
RUN pnpm deploy --filter=@sel/web --prod /prod

FROM nginx:latest

COPY ./apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /prod/dist /usr/share/nginx/html

EXPOSE 80

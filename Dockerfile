# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile

FROM dependencies AS build
ARG NEXT_PUBLIC_TINA_CLIENT_ID
ARG TINA_BRANCH=main
ARG SITE_URL

ENV NEXT_PUBLIC_TINA_CLIENT_ID=$NEXT_PUBLIC_TINA_CLIENT_ID
ENV TINA_BRANCH=$TINA_BRANCH
ENV SITE_URL=$SITE_URL

COPY . .

RUN --mount=type=secret,id=tina_token,env=TINA_TOKEN \
	test -n "$NEXT_PUBLIC_TINA_CLIENT_ID" && \
	test -n "$TINA_TOKEN" && \
	pnpm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN groupadd --system astro && useradd --system --gid astro astro

WORKDIR /app

COPY --from=build --chown=astro:astro /app/dist ./dist

USER astro

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]

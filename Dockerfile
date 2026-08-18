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

COPY . .

RUN pnpm run build

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

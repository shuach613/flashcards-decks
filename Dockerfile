FROM node:22-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# next-auth beta declares an older optional nodemailer peer range; the app uses
# nodemailer directly for SMTP, so install the audited patched release.
RUN npm ci --legacy-peer-deps

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma config reads DATABASE_URL during generation/build.
ENV DATABASE_URL=file:/app/data/flashcards.db
RUN mkdir -p /app/data
RUN npm run build
RUN npm prune --omit=dev --legacy-peer-deps

FROM base AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app ./

RUN mkdir -p /app/data && chown node:node /app/data

USER node
EXPOSE 3000

CMD ["node", "scripts/start-container.mjs"]

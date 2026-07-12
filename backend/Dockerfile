FROM node:22-bookworm-slim AS development

WORKDIR /app
ENV NODE_ENV=development
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node prisma ./prisma
RUN npx prisma generate

COPY --chown=node:node . .
EXPOSE 4000

CMD ["npm", "run", "dev"]

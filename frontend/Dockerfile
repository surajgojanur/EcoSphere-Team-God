FROM node:22-bookworm-slim AS development

WORKDIR /app
ENV NODE_ENV=development
RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

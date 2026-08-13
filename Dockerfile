FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

CMD ["node", "src/index.js"]

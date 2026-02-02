FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src
RUN npm install -g typescript && npm run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]

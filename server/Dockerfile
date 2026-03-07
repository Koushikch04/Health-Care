FROM node:20-bookworm-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "index.js"]

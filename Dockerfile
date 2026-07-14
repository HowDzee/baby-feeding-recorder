FROM node:24-alpine

# Install openssl for better-sqlite3 native build (libssl needed at runtime)
RUN apk add --no-cache python3 make g++ libstdc++ libssl3

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY dist/ ./dist/
COPY server.js ./
COPY data.db* ./

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "server.js"]

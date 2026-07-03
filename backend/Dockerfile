# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG APP_NAME
RUN npx nest build ${APP_NAME}

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/report.proto ./report.proto

ARG APP_NAME
ENV APP=${APP_NAME}

CMD node dist/apps/${APP}/main.js
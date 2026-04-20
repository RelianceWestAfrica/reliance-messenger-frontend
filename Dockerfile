# ─────────────────────────────────────────────
# Stage 1 — Build
# ─────────────────────────────────────────────
FROM node:20.14.0-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package*.json ./

RUN npm install

# Copy source and build
COPY . .

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:1.25-alpine

EXPOSE 80

RUN rm -rf /usr/share/nginx/html/*

COPY src/conf/default.conf /etc/nginx/conf.d/

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/.htaccess /usr/share/nginx/html


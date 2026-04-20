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

# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Custom Nginx config (SPA routing support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output (dist/)
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

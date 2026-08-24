# =========================================================================
# PeakPulse Frontend - Production Multi-Stage Dockerfile
# =========================================================================

# Stage 1: Build React/Vite SPA
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 8443

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

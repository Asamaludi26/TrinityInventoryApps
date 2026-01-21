# =============================================================================
# Frontend Dockerfile
# Trinity Asset Flow - React SPA with Nginx
# =============================================================================
# Build: docker build -t trinity-frontend -f Dockerfile .
# Run:   docker run -d -p 80:80 trinity-frontend
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S trinity && \
    adduser -S trinity -u 1001 -G trinity && \
    chown -R trinity:trinity /usr/share/nginx/html && \
    chown -R trinity:trinity /var/cache/nginx && \
    chown -R trinity:trinity /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R trinity:trinity /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

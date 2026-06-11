# Multi-stage production build for FashionHub ERP-CRM-WMS
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install dependencies including build utilities
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run production build (Vite client-side assets + esbuild server transpilation)
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

# Runtime container state
FROM node:20-slim AS runner

WORKDIR /usr/src/app

# Set production context
ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary package configuration and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build outputs from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/assets ./assets

# Expose server ingress port
EXPOSE 3000

# Start deployment server
CMD ["npm", "run", "start"]

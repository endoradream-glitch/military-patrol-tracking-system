# Use Bun runtime
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Copy package files first (for better caching)
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy TypeScript source files
COPY index.ts ./

# Copy tsconfig.json if it exists
COPY tsconfig.json* ./

# Expose the WebSocket port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the WebSocket service
CMD ["bun", "index.ts"]
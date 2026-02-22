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

# Health check (uses Bun runtime + dynamic PORT with sane fallback)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:' + (process.env.PORT || '3003') + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the WebSocket service
CMD ["bun", "index.ts"]

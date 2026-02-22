# Root-level Dockerfile for Railway monorepo deployments.
# This delegates runtime to the tracking-service mini app.
FROM oven/bun:1

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

# Install only tracking-service dependencies
COPY mini-services/tracking-service/package.json mini-services/tracking-service/bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy tracking-service source
COPY mini-services/tracking-service/index.ts ./index.ts
COPY mini-services/tracking-service/tsconfig.json* ./

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:' + (process.env.PORT || '3003') + '/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "index.ts"]

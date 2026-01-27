# AstraVaani Frontend Dockerfile

FROM node:20-alpine AS builder
WORKDIR /app

# Build-time environment variables (NEXT_PUBLIC_* must be available at build time)
ARG NEXT_PUBLIC_API_URL=https://astravaani-backend.onrender.com/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://astravaani.com
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD npm start -- -p ${PORT:-3000}

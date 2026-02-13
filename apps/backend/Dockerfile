FROM node:20-alpine AS build
WORKDIR /app

# Copy only backend workspace (simple mode)
COPY apps/backend/package.json apps/backend/package-lock.json* ./apps/backend/
WORKDIR /app/apps/backend
RUN npm ci

COPY apps/backend/ ./ 
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/backend/package.json ./package.json
COPY --from=build /app/apps/backend/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./dist

EXPOSE 8080
CMD ["node", "dist/bootstrap/server.js"]

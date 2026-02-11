FROM node:20-alpine AS build
WORKDIR /app

# Copy only api workspace (simple mode)
COPY apps/api/package.json apps/api/package-lock.json* ./apps/api/
WORKDIR /app/apps/api
RUN npm ci

COPY apps/api/ ./ 
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist

EXPOSE 8080
CMD ["node", "dist/server.js"]

FROM node:20-alpine AS build
WORKDIR /app

# Copy only backend workspace (simple mode)
COPY backend/package.json backend/package-lock.json* ./backend/
WORKDIR /backend
RUN npm ci

COPY backend/ ./ 
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /backend/package.json ./package.json
COPY --from=build /backend/node_modules ./node_modules
COPY --from=build /backend/dist ./dist

EXPOSE 8080
CMD ["node", "dist/server.js"]

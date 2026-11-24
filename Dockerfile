# For hosts that run Docker images (Railway, Fly.io, a VPS, ...).
# Build: docker build -t job-portal .   Run: docker run -p 8080:8080 --env-file backend/.env.local job-portal
FROM node:20-alpine
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm --prefix backend ci --omit=dev
COPY backend ./backend
COPY frontend ./frontend
# The app runs as the unprivileged "node" user, which must be able to save uploads
RUN mkdir -p backend/uploads && chown -R node:node backend/uploads
ENV APP_MODE=online NODE_ENV=production PORT=8080
EXPOSE 8080
USER node
CMD ["node", "backend/server.js"]

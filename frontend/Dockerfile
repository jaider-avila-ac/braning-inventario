# ---------- Build de React ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vacío = mismo dominio: nginx reenvía /api y /storage al backend
ARG VITE_API_URL=""
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production.local && npm run build

# ---------- Nginx sirviendo el build ----------
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

FROM node:22-alpine AS build
WORKDIR /app
# Primero solo los manifiestos: mientras no cambien las dependencias, Docker reusa la capa de "npm ci".
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

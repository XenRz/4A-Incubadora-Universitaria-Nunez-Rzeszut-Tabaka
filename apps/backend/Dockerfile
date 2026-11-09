# Imagen base oficial de Node sobre Alpine Linux (liviana)
FROM node:22-alpine

WORKDIR /app

# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa (cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Después el código
COPY src ./src
# el user node sirve para que no se ejecute como root, por seguridad
USER node 
EXPOSE 3000
CMD ["node", "src/main/index.js"]

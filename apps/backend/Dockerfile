# Imagen base oficial de Node sobre Alpine Linux (liviana)
FROM node:22-alpine AS base

WORKDIR /app

# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa (cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Después el código
COPY src ./src

# Etapa de tests: la misma imagen más tests/. Solo la usa el servicio backend-tests del compose
# (perfil "test"); no se despliega. node:test viene con Node: no hay dependencias extra.
FROM base AS test
COPY tests ./tests
USER node
CMD ["node", "--test"]

# Etapa final: la que se despliega (es la última, así que es la que construye "docker compose up").
FROM base AS runtime
# el user node sirve para que no se ejecute como root, por seguridad
USER node
EXPOSE 3000
CMD ["node", "src/main/index.js"]

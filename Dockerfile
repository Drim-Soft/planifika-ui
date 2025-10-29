# Etapa única (modo desarrollo)
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Expón el puerto
EXPOSE 3000

# Inicia Next.js en modo desarrollo para ver todos los console.log()
CMD ["npm", "run", "dev"]

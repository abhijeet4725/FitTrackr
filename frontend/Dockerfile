FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer-cached unless package.json changes)
COPY package*.json ./
RUN npm install

# Copy source (node_modules excluded via .dockerignore)
COPY . .

EXPOSE 5173

# --host 0.0.0.0 is required so Vite listens on all interfaces inside Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

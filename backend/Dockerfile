# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 5000

# If your package.json has: "start": "node index.js"
CMD ["npm", "start"]


# One Dockerfile, runs CRA dev server on 3000
FROM node:20-alpine

WORKDIR /app

# Install deps first (cache-friendly)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# CRA dev server config
ENV PORT=3000
# helps file watching on Windows/WSL
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true


EXPOSE 3000
CMD ["npm", "start"]


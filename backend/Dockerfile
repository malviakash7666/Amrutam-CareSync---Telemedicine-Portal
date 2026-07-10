FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install packages
RUN npm ci

# Copy project source
COPY . .

EXPOSE 5000

# Start backend node process
CMD ["node", "server.js"]

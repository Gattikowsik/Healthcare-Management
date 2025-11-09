# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema (needed before npm install for postinstall scripts)
COPY prisma ./prisma/

# Install dependencies (includes prisma for generating client)
RUN npm install --production=false

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src/
COPY update-mappings.js ./

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]

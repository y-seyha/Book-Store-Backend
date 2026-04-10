# Use Node.js 18
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install --include=dev

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Run NestJS in dev mode
CMD ["npm", "run", "start:dev"]
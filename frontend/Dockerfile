# AstraVaani Frontend Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Run development server (use `npm run build && npm start` for production)
CMD ["npm", "run", "dev"]

FROM node:20

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (both production and development)
RUN npm install

# Copy the rest of the application
COPY . .

# Ensure node_modules/.bin is in PATH
ENV PATH="/app/node_modules/.bin:$PATH"

EXPOSE 3000

# Use npm start to run the application
CMD ["npm", "run", "dev"]

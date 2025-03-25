# Use Node.js as the base image for building the application
FROM node:16-alpine AS builder

# Set the working directory
WORKDIR /app

# Install Git and build dependencies
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package*.json ./

# Install node modules and prettier
RUN npm install --legacy-peer-deps && \
    npm install --save-dev prettier

# Copy project files
COPY . ./

# Run Prettier formatting
RUN npm run format && \
    npm run format:check

# Create .env file with local network configuration
RUN echo "REACT_APP_NETWORK=localhost" > .env && \
    echo "REACT_APP_RPC_URL=http://127.0.0.1:8545" >> .env && \
    echo "REACT_APP_NETWORK_ID=1337" >> .env && \
    echo "PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" >> .env

# Create deployment directory
RUN mkdir -p src/backend/scripts

# Clean Hardhat cache and artifacts
RUN npx hardhat clean

# Download compiler and compile contracts with retry mechanism
RUN for i in 1 2 3; do \
        npx hardhat compile && break || sleep 5; \
    done

# Create required directory for deployment output
RUN mkdir -p frontend/contractsData

# Start compilation and deployment
RUN npx hardhat node > /dev/null 2>&1 & \
    sleep 15 && \
    npx hardhat run backend/scripts/deploy.js --network localhost && \
    npm run build

# Nginx configuration
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy built assets
COPY --from=builder /app/build .
COPY --from=builder /app/backend/artifacts /usr/share/nginx/html/artifacts

EXPOSE 3000 8545
CMD ["nginx", "-g", "daemon off;"]

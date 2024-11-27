# Base image for building the application
FROM node:20.11.1 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./client/package.json ./client/package-lock.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY ./client/ .

# Build the Vite React application
RUN npm run build

# Base image for running the application
FROM node:20.11.1

# Install cloudflared in the container
RUN apt update && apt install -y wget && \
  wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb && \
  dpkg -i cloudflared-linux-arm64.deb && \
  rm cloudflared-linux-arm64.deb

# Configure SSH
RUN mkdir -p /root/.ssh && \
  echo "Host ssh.cloudpeak.dev\n  ProxyCommand /usr/local/bin/cloudflared access ssh --hostname %h" >> /root/.ssh/config

# Add server's public key to known hosts
RUN echo "ssh.cloudpeak.dev ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDdw5VRy59xmdt7gpb9VuYo1pVYM2Cfjc5XAp94WCqYm" >> ~/.ssh/known_hosts

# Set the working directory
WORKDIR /app

# Copy the server files
COPY ./index.js ./
COPY ./package.json ./
COPY ./package-lock.json ./

# Copy the build files from the builder stage
COPY --from=builder /app/dist ./client/dist

# Copy server files
COPY --from=builder /app/package*.json ./client

# Install only production dependencies
RUN npm install --only=production

# Expose the port that the Express server will listen on
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
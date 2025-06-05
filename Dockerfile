# Base image for building the application
FROM node:24.1.0 AS base

# Install server dependencies
FROM base AS server-deps
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci --only=production

# Install client dependencies
FROM base AS client-deps
WORKDIR /app
COPY ./client/package.json ./client/package-lock.json ./
RUN npm ci

# Build the client application with client dependencies
FROM base AS client-builder
WORKDIR /app
COPY --from=client-deps /app/node_modules ./node_modules
COPY ./client/ .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create .ssh folder which will be populated with necessary keys to allow SSH access
# Node user is available from the node base image
RUN mkdir -p /home/node/.ssh \
  && chown -R node:node /home/node/.ssh \
  && chmod -R 700 /home/node/.ssh

# Add server's public key to known hosts
RUN echo "host.docker.internal ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDdw5VRy59xmdt7gpb9VuYo1pVYM2Cfjc5XAp94WCqYm" >> /home/node/.ssh/known_hosts \
  && chown -R node:node /home/node/.ssh/known_hosts \
  && chmod 600 /home/node/.ssh/known_hosts

# Copy everything to run the server
COPY --chown=node:node ./src/ ./src/
COPY --from=server-deps /app/node_modules ./node_modules
COPY --from=client-builder --chown=node:node /app/dist ./client/dist

USER node

# Expose the port that the Express server will listen on
EXPOSE 8080
ENV PORT=8080

# Start the server
CMD ["node", "./src/index.js"]
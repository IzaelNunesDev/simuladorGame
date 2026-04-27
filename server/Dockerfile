FROM node:20-slim

WORKDIR /app

# Copy package files if needed, but for this simple server we can just install ws
RUN npm install ws

COPY multiplayer-server.js .

# Expose the port
EXPOSE 3001

# Run the server
CMD ["node", "multiplayer-server.js"]

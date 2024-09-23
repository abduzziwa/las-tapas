# Use the base image
FROM node:18-bullseye

# Install MongoDB
RUN apt-get update && \
    apt-get install -y gnupg wget && \
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add - && \
    echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" > /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org

# Set the working directory
WORKDIR /LAS_TAPAS

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose ports
EXPOSE 3000 27017

# # Start MongoDB and the Next.js app
# CMD service mongod start && npm run dev
# Start MongoDB and the Next.js app
CMD ["sh", "-c", "mongod --bind_ip_all & npm run dev"]
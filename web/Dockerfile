# Use a specific version of node as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY web/package.json web/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY web/ .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app (here, npm run dev)
CMD ["npm", "run", "dev"]

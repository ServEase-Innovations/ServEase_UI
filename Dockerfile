# Use the official Node.js 21 image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining application code to the working directory
COPY . .

# Set CI to false to prevent warnings from failing the build
ENV CI=false

# Build the React app for production
RUN npm run build

# Expose port 3000 (adjust to the port your React app will run on)
EXPOSE 3000

# Define the command to run the application (start the React app in production mode)
CMD ["npm", "start"]

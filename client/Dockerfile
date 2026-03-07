# ---------- Stage 1: Build the frontend ----------
# Use a lightweight Node.js image to build the application
FROM node:20-alpine AS builder

# Set working directory inside the container
# All subsequent commands will run inside /app
WORKDIR /app

# Copy dependency files first
# This allows Docker to cache the dependency installation layer
# If only source code changes, npm install will not run again
COPY package*.json ./

# Install dependencies using npm ci
# npm ci is faster and ensures a reproducible install using package-lock.json
RUN npm ci

# Copy the rest of the application source code
# This includes src, public, config files, etc.
COPY . .

# Build-time argument (can be overridden during docker build)
# Example:
# docker build --build-arg VITE_BACKEND=https://api.example.com .
ARG VITE_BACKEND=http://localhost:8000

# Set environment variable so the build process (e.g. Vite) can access it
# Vite exposes variables starting with VITE_ to the frontend
ENV VITE_BACKEND=$VITE_BACKEND

# Build the frontend application
# This typically runs "vite build" or similar
# Output will be generated in the /app/dist directory
RUN npm run build



# ---------- Stage 2: Runtime image ----------
# Use a lightweight nginx image to serve the built static files
FROM nginx:1.27-alpine

# Copy custom nginx configuration
# This usually enables proper routing for SPAs (React/Vue)
# and may include caching or compression settings
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage
# Only the final compiled static files are copied, not source code or node_modules
COPY --from=builder /app/dist /usr/share/nginx/html

# Document that the container listens on port 80
# (actual port mapping is defined when running the container)
EXPOSE 80

# Start nginx in the foreground
# nginx normally runs as a background daemon, but Docker requires a foreground process
CMD ["nginx", "-g", "daemon off;"]




# Node was only used to build and Nginx served files
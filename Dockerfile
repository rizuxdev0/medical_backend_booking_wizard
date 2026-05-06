# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (no devDependencies)
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
# Copy database scripts (needed for your automatic schema fix logic)
COPY --from=builder /app/src/database ./src/database

# Create uploads directory with subdirectories
RUN mkdir -p uploads/patient-documents uploads/avatars

# Expose the port the app runs on (Render uses PORT env var)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Command to run the application
CMD ["node", "dist/main"]

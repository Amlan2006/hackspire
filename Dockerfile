FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./


# Install dependencies
RUN bun install 

# Copy all necessary files
COPY src/ ./src/
COPY tsconfig.json ./

COPY README.md ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]

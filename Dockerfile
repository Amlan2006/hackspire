FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all necessary files
COPY src/ ./src/
COPY tsconfig.json ./
COPY .env ./
COPY README.md ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]

# Set Node.js version
ARG NODE_VERSION=24

# Base stage for dependency installation
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Set ENVs
ENV NODE_ENV=production

# Copy only package manager files for caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install only dependencies
RUN pnpm install --prod --ignore-scripts --frozen-lockfile --prefer-offline

# Build stage (Uses devDependencies)
FROM base AS build

# Install all dependencies, including devDependencies for build
RUN pnpm install --prod=false --ignore-scripts --frozen-lockfile --prefer-offline

# Copy all the files
COPY . .

# Execute build
RUN pnpm build

# Production stage image
FROM node:${NODE_VERSION}-alpine AS final
WORKDIR /app

# Set ENVs
ENV NODE_ENV=production

# Copy required files from the images
COPY --from=base /app/package.json package.json
COPY --from=base /app/node_modules node_modules
COPY --from=build /app/public public
COPY --from=build /app/.next .next

# Start script
CMD ["npm", "start"]

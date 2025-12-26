# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Install yarn globally to ensure it's available
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy package files
COPY package.json ./
COPY yarn.lock ./

# Install dependencies (ignore engines for compatibility)
RUN yarn install --frozen-lockfile --ignore-engines --network-timeout 100000

# Copy source code
COPY . .

# Build args
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the app
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

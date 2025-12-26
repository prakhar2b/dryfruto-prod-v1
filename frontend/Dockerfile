# Build stage
FROM node:18-alpine as build
WORKDIR /app

# Copy package.json only
COPY package.json ./

# Install dependencies using npm (more compatible)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build args
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Étape 1 : Construction du bundle de production React avec Vite
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Étape 2 : Service des fichiers statiques avec Nginx haute performance
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

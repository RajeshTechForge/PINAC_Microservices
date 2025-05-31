FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install jose

COPY auth-service.js ./

EXPOSE 8080

CMD ["node", "auth-service.js"]

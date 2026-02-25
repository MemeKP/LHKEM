FROM node:22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# RUN npm run build
ARG VITE_API_URL=http://localhost:3000
RUN VITE_API_URL=$VITE_API_URL npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

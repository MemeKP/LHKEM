FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN mkdir -p /app/uploads

EXPOSE 3000

# CMD ["npm", "run", "start:dev"]
CMD ["sh", "-c", "node dist/seeder/seeder.js && node dist/main.js"]
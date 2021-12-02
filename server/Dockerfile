FROM node:16

WORKDIR /hero-lottery/server

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4002
CMD [ "node", "index.js" ]
FROM node:16

WORKDIR /scraper

COPY /scraper/package.json .

RUN npm install

COPY /scraper .

EXPOSE 3000
CMD [ "node", "index.js" ]
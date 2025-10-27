FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

COPY .env .

EXPOSE 4004

CMD ["npm", "start"]
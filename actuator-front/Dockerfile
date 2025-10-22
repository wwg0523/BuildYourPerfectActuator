FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

COPY .env .

EXPOSE 3000

CMD ["npx", "serve", "-s", "build", "-l", "3000"]
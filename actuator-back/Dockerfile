FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 4004

# Production 모드에서 컴파일된 코드 실행
CMD npm start
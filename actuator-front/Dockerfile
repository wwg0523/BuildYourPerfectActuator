FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5005

# Production 빌드 및 serve 사용
CMD bash -c '\
  npm run build && \
  npx serve -s build -l 5005'
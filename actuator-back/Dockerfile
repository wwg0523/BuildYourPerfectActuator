FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 4004

# 런타임에 .env 파일을 생성
CMD bash -c '\
  if [ ! -f .env ]; then \
    echo "Creating .env file from environment variables..."; \
    cat > .env << EOF\
DB_USER=${DB_USER:-postgres}\
DB_HOST=${DB_HOST:-actuator-db}\
DB_NAME=${DB_NAME:-actuator_game}\
DB_PASS=${DB_PASS:-1209}\
DB_PORT=${DB_PORT:-5432}\
PORT=${PORT:-4004}\
APP_EMAIL=${APP_EMAIL:-}\
APP_PASS=${APP_PASS:-}\
ANALYTICS_PASSWORD=${ANALYTICS_PASSWORD:-admin123}\
NODE_ENV=${NODE_ENV:-production}\
FRONTEND_URL=${FRONTEND_URL:-}\
EOF\
    echo "✅ .env file created"; \
    cat .env; \
  fi && \
  npm start'
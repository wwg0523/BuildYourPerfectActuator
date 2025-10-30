FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5005

# 런타임에 .env 파일을 생성하고 빌드
CMD bash -c '\
  if [ ! -f .env ]; then \
    echo "Creating .env file from environment variables..."; \
    cat > .env << EOF\
REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL:-http://actuator-back:4004}\
REACT_APP_ENCRYPTION_KEY=${REACT_APP_ENCRYPTION_KEY:-your-secret-key-32bytes-long!!!}\
REACT_APP_ANALYTICS_PASSWORD=${REACT_APP_ANALYTICS_PASSWORD:-admin123}\
REACT_APP_API_NINJAS_KEY=${REACT_APP_API_NINJAS_KEY:-}\
EOF\
    echo "✅ .env file created"; \
    cat .env; \
  fi && \
  npm run build && \
  npm start'
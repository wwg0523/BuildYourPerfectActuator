FROM node:18 AS builder

WORKDIR /app

# 의존성 파일 먼저 복사 (변경 빈도 낮음)
COPY package*.json ./

# npm ci 사용 (npm install보다 빠르고 안정적)
RUN npm ci --only=production && \
    npm install react-scripts

# 소스 코드 복사 (변경 빈도 높음, SCSS 포함)
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./

# 빌드 시 환경 변수 설정
ARG REACT_APP_ENCRYPTION_KEY=your-32byte-secret-key
ENV REACT_APP_ENCRYPTION_KEY=$REACT_APP_ENCRYPTION_KEY

# 프로덕션 빌드
RUN npm run build

# 최종 스테이지 - Nginx 사용
FROM nginx:alpine

WORKDIR /app

# Nginx 설정 복사
COPY --from=builder /app/build ./build
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5005

CMD ["nginx", "-g", "daemon off;"]
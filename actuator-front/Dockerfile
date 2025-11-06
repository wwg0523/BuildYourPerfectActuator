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
ARG REACT_APP_BACKEND_URL=http://actuator-back:4004
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# 프로덕션 빌드
RUN npm run build

# 최종 스테이지
FROM node:18-alpine

WORKDIR /app

# serve만 설치
RUN npm install -g serve

# 빌드된 파일 복사
COPY --from=builder /app/build ./build

EXPOSE 5005

CMD serve -s build -l 5005
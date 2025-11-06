FROM node:18 AS builder

WORKDIR /app

# 의존성 파일 먼저 복사 (변경 빈도 낮음)
COPY package*.json ./
COPY tsconfig.json ./

# npm ci 사용 (npm install보다 빠르고 안정적)
RUN npm ci

# 소스 코드 복사 (변경 빈도 높음)
COPY src/ ./src/

# TypeScript 컴파일
RUN npm run build

# 최종 스테이지
FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 컴파일된 파일 복사
COPY --from=builder /app/dist ./dist

EXPOSE 4004

CMD npm start
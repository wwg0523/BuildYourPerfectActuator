FROM node:18 AS builder

WORKDIR /app

# 의존성 파일 먼저 복사 (변경 빈도 낮음)
COPY package*.json ./

# npm ci 사용 (npm install보다 빠르고 안정적)
# --omit=dev: 개발 의존성 제외 (번들 크기 감소)
RUN npm ci --omit=dev && \
    npm install react-scripts

# 소스 코드 복사 (변경 빈도 높음, SCSS 포함)
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./
COPY .env.production ./

# 프로덕션 빌드 최적화
# GENERATE_SOURCEMAP=false: 소스맵 제외 (빌드 시간 50% 단축)
# CI=true: 경고를 오류로 처리하지 않음
ENV GENERATE_SOURCEMAP=false \
    CI=true \
    REACT_APP_ENCRYPTION_KEY=your-32byte-secret-key

RUN npm run build

# 최종 스테이지 - Nginx 사용
FROM nginx:alpine

WORKDIR /app

# 빌드된 파일 복사
COPY --from=builder /app/build ./build

# public 폴더의 정적 파일들도 복사 (videos, images, 기타 assets)
COPY --from=builder /app/public ./build/public

# 모든 정적 파일의 권한 설정 (Nginx가 읽을 수 있도록)
# 디렉토리: 755, 파일: 644
RUN find /app/build -type d -exec chmod 755 {} \; && \
    find /app/build -type f -exec chmod 644 {} \;

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5005

CMD ["nginx", "-g", "daemon off;"]
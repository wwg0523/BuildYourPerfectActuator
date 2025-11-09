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

# 빌드 인자 및 환경변수 정의
ARG REACT_APP_ENCRYPTION_KEY=your-32byte-secret-key
ARG NODE_ENV=production

# 프로덕션 빌드 최적화
# GENERATE_SOURCEMAP=false: 소스맵 제외 (빌드 시간 50% 단축)
# CI=false: 경고를 오류로 처리하지 않음 (빌드 속도 향상)
ENV GENERATE_SOURCEMAP=false \
    CI=false \
    REACT_APP_ENCRYPTION_KEY=${REACT_APP_ENCRYPTION_KEY} \
    NODE_ENV=${NODE_ENV}

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

# 엔트리포인트 스크립트 복사 (환경변수 치환용)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 5005

ENTRYPOINT ["/docker-entrypoint.sh"]
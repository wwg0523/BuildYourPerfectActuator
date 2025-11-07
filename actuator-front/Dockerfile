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

# 빌드된 파일 복사
COPY --from=builder /app/build ./build

# public 폴더의 정적 파일들도 복사 (videos, images, 기타 assets)
COPY --from=builder /app/public ./build/public

# 모든 정적 파일의 권한 설정 (Nginx가 읽을 수 있도록)
# 디렉토리: 755 (rwxr-xr-x), 파일: 644 (rw-r--r--)
RUN find /app/build -type d -exec chmod 755 {} \; && \
    find /app/build -type f -exec chmod 644 {} \; && \
    find /app/build -name "*.mp4" -o -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" | xargs chmod 644 2>/dev/null || true

# Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 프로세스 권한 확인
RUN chmod 755 /app/build && \
    ls -la /app/build/

EXPOSE 5005

CMD ["nginx", "-g", "daemon off;"]
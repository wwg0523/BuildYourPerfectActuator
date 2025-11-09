#!/bin/sh
# Nginx 설정의 환경변수를 치환

# 기본값 설정
export FRONTEND_PORT=${FRONTEND_PORT:-5005}
export BACKEND_HOST=${BACKEND_HOST:-actuator-back}
export BACKEND_PORT=${BACKEND_PORT:-4004}

# envsubst를 사용하여 환경변수 치환
envsubst < /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

# Nginx 시작
exec nginx -g "daemon off;"

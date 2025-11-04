#!/bin/bash

# Synology NAS 자동 업데이트 스크립트
# 이 스크립트는 GitHub에서 코드 변경이 있을 때 자동으로 실행됩니다

set -e

# 설정
PROJECT_DIR="/volume1/build-your-perfect-actuator"
LOG_DIR="/volume1/build-your-perfect-actuator/logs"
LOG_FILE="${LOG_DIR}/update-$(date +%Y%m%d-%H%M%S).log"
REPO_URL="https://github.com/wwg0523/BuildYourPerfectActuator.git"

# 로그 디렉토리 생성
mkdir -p "${LOG_DIR}"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "=== GitHub 자동 업데이트 시작 ==="
log "프로젝트 디렉토리: ${PROJECT_DIR}"

# 프로젝트 디렉토리로 이동
if [ ! -d "${PROJECT_DIR}" ]; then
    log "오류: 프로젝트 디렉토리를 찾을 수 없습니다: ${PROJECT_DIR}"
    exit 1
fi

cd "${PROJECT_DIR}"

# Git 풀링
log "Git 저장소 업데이트 중..."
git fetch origin main
git reset --hard origin/main

log "Git 업데이트 완료"

# .sh 파일 권한 복구 (Webhook 실행 시 권한 손실 방지)
log "배포 스크립트 권한 복구 중..."
chmod +x deployment/*.sh
log ".sh 파일 권한 복구 완료"

# Docker 컨테이너 정지
log "Docker 컨테이너 정지 중..."
docker-compose -f docker-compose.prod.yaml down

log "이미지 및 컨테이너 완전 정리 중..."
# 이미지 강제 삭제
docker rmi actuator-back:latest 2>/dev/null || true
docker rmi actuator-front:latest 2>/dev/null || true

# 댕글링 이미지 제거
docker image prune -f 2>/dev/null || true

log "Docker 빌드 캐시 제거 중..."
# 노드 모듈 캐시도 제거하기 위해 --no-cache 옵션 사용
docker-compose -f docker-compose.prod.yaml build --no-cache

log "Docker 이미지 재빌드 완료, 컨테이너 시작 중..."
docker-compose -f docker-compose.prod.yaml up -d

# 컨테이너 상태 확인
log "컨테이너 상태 확인 중..."
sleep 5

if docker-compose -f docker-compose.prod.yaml ps | grep -q "Up"; then
    log "✓ 컨테이너가 정상적으로 실행 중입니다"
else
    log "✗ 컨테이너 실행 중 문제가 발생했습니다"
    docker-compose -f docker-compose.prod.yaml logs
    exit 1
fi

log "=== GitHub 자동 업데이트 완료 ==="

# 로그 파일 위치 출력
echo "로그 파일: ${LOG_FILE}"

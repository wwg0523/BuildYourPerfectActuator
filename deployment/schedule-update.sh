#!/bin/bash

# 정기적 업데이트 스크립트 (Cron 사용)
# 
# 설치 방법:
# 1. 이 스크립트를 /volume1/build-your-perfect-actuator/schedule-update.sh에 저장
# 2. chmod +x /volume1/build-your-perfect-actuator/schedule-update.sh 실행
# 3. crontab -e 명령어로 크론탭 편집
# 4. 다음 중 하나를 크론탭에 추가:
#    
#    # 매일 오전 2시에 업데이트 (UTC 기준)
#    0 2 * * * /volume1/build-your-perfect-actuator/schedule-update.sh
#    
#    # 매일 오전 2시, 오후 2시에 업데이트
#    0 2,14 * * * /volume1/build-your-perfect-actuator/schedule-update.sh
#    
#    # 모든 요일 오후 6시에 업데이트
#    0 18 * * * /volume1/build-your-perfect-actuator/schedule-update.sh

set -e

# 설정
PROJECT_DIR="/volume1/build-your-perfect-actuator"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/scheduled-update-$(date +%Y%m%d-%H%M%S).log"
REPO_URL="https://github.com/wwg0523/BuildYourPerfectActuator.git"
LOCK_FILE="${PROJECT_DIR}/.deployment-lock"
LOCK_TIMEOUT=600  # 10분 (배포 완료 타임아웃)

# 로그 디렉토리 생성
mkdir -p "${LOG_DIR}"

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Lock 파일 확인 (배포 중복 방지)
check_lock() {
    if [ -f "${LOCK_FILE}" ]; then
        LOCK_TIME=$(stat -c %Y "${LOCK_FILE}" 2>/dev/null || date +%s)
        CURRENT_TIME=$(date +%s)
        TIME_DIFF=$((CURRENT_TIME - LOCK_TIME))
        
        if [ $TIME_DIFF -lt $LOCK_TIMEOUT ]; then
            log "배포가 진행 중입니다. 스킵합니다. (${TIME_DIFF}초 경과)"
            exit 0
        else
            log "이전 배포 Lock이 만료되었습니다. 제거하고 진행합니다."
            rm -f "${LOCK_FILE}"
        fi
    fi
}

log "=== 정기적 자동 업데이트 시작 ==="
log "예약된 시간에 의해 자동 실행됨"

# Lock 파일 확인
check_lock

# 프로젝트 디렉토리 확인
if [ ! -d "${PROJECT_DIR}" ]; then
    log "오류: 프로젝트 디렉토리를 찾을 수 없습니다: ${PROJECT_DIR}"
    exit 1
fi

cd "${PROJECT_DIR}"

# 최근 변경사항이 있는지 확인
log "원격 저장소에서 변경사항 확인 중..."
git fetch origin main

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    log "변경사항이 없습니다. 업데이트를 건너뜁니다."
    log "로컬: $LOCAL_COMMIT"
    log "원격: $REMOTE_COMMIT"
    exit 0
fi

log "새로운 변경사항이 감지되었습니다. 업데이트 시작..."
log "로컬: $LOCAL_COMMIT"
log "원격: $REMOTE_COMMIT"

# Lock 파일 생성 (배포 중복 방지)
touch "${LOCK_FILE}"
log "배포 Lock 파일 생성됨"

# Git 재설정
log "Git 저장소 업데이트 중..."
git reset --hard origin/main
log "Git 업데이트 완료"

# Docker 컨테이너 정지
log "Docker 컨테이너 정지 중..."
/usr/local/bin/docker-compose -f docker-compose.prod.yaml down

log "이미지 삭제 중..."
docker rmi actuator-back:latest 2>/dev/null || true
docker rmi actuator-front:latest 2>/dev/null || true

# Docker 재빌드 및 시작
log "Docker 이미지 재빌드 및 실행 중..."
/usr/local/bin/docker-compose -f docker-compose.prod.yaml up -d

# 컨테이너 상태 확인
log "컨테이너 상태 확인 중..."
sleep 5

if /usr/local/bin/docker-compose -f docker-compose.prod.yaml ps | grep -q "Up"; then
    log "✓ 컨테이너가 정상적으로 실행 중입니다"
else
    log "✗ 컨테이너 실행 중 문제가 발생했습니다"
    /usr/local/bin/docker-compose -f docker-compose.prod.yaml logs >> "${LOG_FILE}" 2>&1
    exit 1
fi

log "=== 정기적 자동 업데이트 완료 ==="
log "로그 파일: ${LOG_FILE}"

# Lock 파일 제거
rm -f "${LOCK_FILE}"
log "배포 Lock 파일 제거됨"
